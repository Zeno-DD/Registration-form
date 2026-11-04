import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Thay đổi email và mật khẩu hardcode tùy ý bạn ở đây
    const ADMIN_EMAIL = 'vuhuyhoang357@gmail.com';
    const ADMIN_PASSWORD = '123456@Password'; // Mật khẩu cứng của bạn

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Đặt cookie xác thực đơn giản
      response.cookies.set('admin_logged_in', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 ngày
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Email hoặc mật khẩu quản trị không đúng.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Lỗi hệ thống.' },
      { status: 500 }
    );
  }
}
