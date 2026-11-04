import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Đăng ký chuyên đề', description: 'Cổng đăng ký chuyên đề' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="vi"><body>{children}</body></html>; }
