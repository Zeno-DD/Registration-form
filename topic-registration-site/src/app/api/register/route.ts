import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { registrationSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  // Kiểm tra origin cơ bản
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 403 });
  }

  // Validate dữ liệu đầu vào qua Zod schema
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

  // 2. Lưu thông tin đăng ký vào bảng registrations
  const { error: insertError } = await db.from('registrations').insert({
    topic_id: topic.id,
    student_name: v.studentName,
    student_code: v.studentCode,
    email: v.email,
    phone: v.phone,
    topic_title: topic.title,
    source: 'website'
  });

  if (insertError) {
    // Trùng khóa duy nhất (unique constraint)
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Đề tài này vừa được đăng ký bởi sinh viên khác. Vui lòng chọn đề tài khác.' },
        { status: 409 }
      );
    }
    // Trả về thông báo lỗi chi tiết từ Supabase để phát hiện ngay cột bị lệch
    return NextResponse.json(
      { error: `Lỗi Supabase: ${insertError.message} ${insertError.details ? `(${insertError.details})` : ''}` },
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
