export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  // Lấy thêm cột category và stt, đồng thời sắp xếp luôn theo STT từ Database
  const { data, error } = await supabaseAdmin()
    .from('topics')
    .select(`
      id,
      title,
      is_registered,
      category,
      stt,
      teachers (
        name
      )
    `)
    .order('stt', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formatted = data.map((t: any) => {
    // Xử lý quan hệ bảng (đảm bảo không bị lỗi nếu là mảng hay object)
    const teacher = Array.isArray(t.teachers) ? t.teachers[0] : t.teachers;
    
    return {
      id: t.id,
      title: t.title,
      occupied: t.is_registered,
      category: t.category || '', // Trả về chuyên ngành
      stt: t.stt || 0,            // Trả về STT
      advisor: teacher?.name || 'Chưa rõ',
    };
  });

  return NextResponse.json(formatted);
}
