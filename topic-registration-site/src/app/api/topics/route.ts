import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = supabaseAdmin();
  
  // Truy vấn bảng topics và kết nối (join) với bảng teachers để lấy tên giáo viên
  const { data, error } = await db
    .from('topics')
    .select(`
      id,
      title,
      is_registered,
      teachers (
        name
      )
    `);

  if (error) {
    return NextResponse.json({ error: 'Không tải được danh sách đề tài.' }, { status: 500 });
  }

  // Định dạng lại dữ liệu khớp chính xác với kiểu Topic ở phía frontend
  const formattedData = (data || []).map((item: any) => ({
    id: item.id.toString(),
    category: '', // Có thể để trống nếu không phân loại
    title: item.title,
    advisor: item.teachers?.name || 'Chưa phân công',
    occupied: item.is_registered
  }));

  return NextResponse.json(formattedData, { headers: { 'Cache-Control': 'no-store' } });
}
