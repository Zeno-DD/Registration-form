import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { registrationSchema } from '@/lib/validation';

// Bỏ dấu, hạ chữ thường để so sánh họ tên
function normName(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  }

  const parsed = registrationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.' },
      { status: 400 }
    );
  }

  const v = parsed.data;
  const db = supabaseAdmin();
  const studentCode = v.studentCode.trim().toUpperCase();

  // 1. Kiểm tra mã sinh viên và họ tên trong danh sách lớp
  const { data: student } = await db
    .from('students')
    .select('student_code, full_name, locked')
    .eq('student_code', studentCode)
    .maybeSingle();

  if (!student) {
    return NextResponse.json({ error: 'Mã sinh viên không có trong danh sách lớp.' }, { status: 403 });
  }
  if (normName(student.full_name) !== normName(v.studentName)) {
    return NextResponse.json({ error: 'Họ tên không khớp với mã sinh viên.' }, { status: 403 });
  }

  // 2. Mỗi sinh viên chỉ được một đăng ký
  const ALREADY = 'Bạn đã đăng ký một đề tài rồi. Muốn đổi đề tài, hãy liên hệ quản trị viên để hủy đăng ký cũ.';
  if (student.locked) {
    return NextResponse.json({ error: ALREADY }, { status: 409 });
  }
  const { data: existing } = await db
    .from('registrations')
    .select('id')
    .eq('student_code', studentCode)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: ALREADY }, { status: 409 });
  }

  // 3. Kiểm tra đề tài
  const numericTopicId = Number(v.topicId);
  const { data: topic, error: topicError } = await db
    .from('topics')
    .select('id, title, teacher_id, is_registered')
    .eq('id', numericTopicId)
    .maybeSingle();

  if (topicError || !topic) {
    return NextResponse.json({ error: 'Đề tài không tồn tại.' }, { status: 404 });
  }
  if (topic.is_registered) {
    return NextResponse.json(
      { error: 'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.' },
      { status: 409 }
    );
  }

  // 4. Ghi đăng ký
  const { error: insertError } = await db.from('registrations').insert({
    topic_id: topic.id,
    student_name: student.full_name,
    student_code: studentCode,
    email: v.email,
    phone: v.phone,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      if (insertError.message.includes('student_code')) {
        return NextResponse.json({ error: ALREADY }, { status: 409 });
      }
      return NextResponse.json(
        { error: 'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: `Lỗi lưu đăng ký: ${insertError.message}` }, { status: 500 });
  }

  // 5. Đánh dấu đề tài đã có người đăng ký
  const { error: updateError } = await db
    .from('topics')
    .update({ is_registered: true })
    .eq('id', topic.id);

  if (updateError) {
    return NextResponse.json(
      { error: 'Đã ghi nhận đăng ký nhưng cập nhật trạng thái đề tài gặp lỗi. Vui lòng liên hệ quản trị viên.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
