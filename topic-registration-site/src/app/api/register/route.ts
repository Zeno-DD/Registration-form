import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { registrationSchema } from '@/lib/validation';

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
  const numericTopicId = Number(v.topicId);

  // 1. Kiểm tra đề tài trong bảng topics
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

  // 2. Chèn vào bảng registrations chỉ với các cột thực tế có trong schema
  const { error: insertError } = await db.from('registrations').insert({
    topic_id: topic.id,
    student_name: v.studentName,
    student_code: v.studentCode,
    email: v.email,
    phone: v.phone,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Lỗi lưu đăng ký: ${insertError.message}` },
      { status: 500 }
    );
  }

  // 3. Đánh dấu đề tài đã được đăng ký (is_registered = true)
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
