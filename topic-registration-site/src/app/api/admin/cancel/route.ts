import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'Thiếu thông tin ID đăng ký' }, { status: 400 });
    }

    // Đã thêm dấu () vào sau supabaseAdmin
    const { error } = await supabaseAdmin().rpc('cancel_registration', {
      p_registration_id: registrationId
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đã xóa đăng ký và cập nhật trạng thái đề tài!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
