export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  // ĐÃ XÓA ĐOẠN KIỂM TRA ĐĂNG NHẬP (isAdminSession) Ở ĐÂY

  // Join registrations -> topics -> teachers để lấy tên đề tài và giáo viên
  const { data, error } = await supabaseAdmin()
    .from('registrations')
    .select(`
      id,
      student_name,
      student_code,
      email,
      phone,
      created_at,
      topics (
        title,
        teachers (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Chuẩn hóa cấu trúc trả về đúng interface Row của Frontend
  const rows = (data || []).map((r: any) => {
    const topic = Array.isArray(r.topics) ? r.topics[0] : r.topics;
    const teacher = topic?.teachers ? (Array.isArray(topic.teachers) ? topic.teachers[0] : topic.teachers) : null;

    return {
      id: String(r.id),
      student_name: r.student_name,
      student_code: r.student_code,
      email: r.email,
      phone: r.phone,
      advisor: teacher?.name || '',
      topic_title: topic?.title || '',
      created_at: r.created_at,
    };
  });

  return NextResponse.json(rows);
}
