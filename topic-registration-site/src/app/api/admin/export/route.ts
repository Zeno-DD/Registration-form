export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  // Đã xóa phần kiểm tra đăng nhập (isAdminSession) để cho phép tải trực tiếp

  // Join registrations -> topics -> teachers
  const { data, error } = await supabaseAdmin()
    .from('registrations')
    .select(`
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

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Đăng ký');

  ws.columns = [
    { header: 'Họ và tên', key: 'student_name', width: 28 },
    { header: 'Mã sinh viên', key: 'student_code', width: 18 },
    { header: 'Gmail', key: 'email', width: 32 },
    { header: 'Số điện thoại', key: 'phone', width: 18 },
    { header: 'Giáo viên hướng dẫn', key: 'advisor', width: 28 },
    { header: 'Đề tài', key: 'topic_title', width: 60 },
    { header: 'Thời gian đăng ký', key: 'created_at', width: 24 },
  ];

  const rows = (data || []).map((r: any) => {
    const topic = Array.isArray(r.topics) ? r.topics[0] : r.topics;
    const teacher = topic?.teachers ? (Array.isArray(topic.teachers) ? topic.teachers[0] : topic.teachers) : null;

    return {
      student_name: r.student_name,
      student_code: r.student_code,
      email: r.email,
      phone: r.phone,
      advisor: teacher?.name || '',
      topic_title: topic?.title || '',
      created_at: r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : '',
    };
  });

  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Danh-sach-dang-ky.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
