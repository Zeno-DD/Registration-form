import { NextResponse } from 'node:server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // 1. Lấy dữ liệu đăng ký từ Database của bạn (ví dụ từ Supabase)
    // Tạm thời dùng dữ liệu mẫu để minh họa:
    const registrations = [
      { id: 1, fullName: 'Nguyễn Văn A', email: 'a@gmail.com', topic: 'Bảo mật ứng dụng Web', createdAt: '2026-06-01' },
      { id: 2, fullName: 'Trần Thị B', email: 'b@gmail.com', topic: 'Kiểm thửâm nhập mạng', createdAt: '2026-06-02' },
    ];

    // 2. Chuyển đổi dữ liệu thành dạng Sheet của Excel
    const worksheet = XLSX.utils.json_to_sheet(registrations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachDangKy');

    // 3. Xuất file dưới dạng buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // 4. Trả về file cho trình duyệt tải xuống
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Danh-sach-dang-ky.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Không thể xuất file Excel.' }, { status: 500 });
  }
}
