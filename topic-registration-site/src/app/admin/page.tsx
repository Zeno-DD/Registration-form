'use client';

import { useEffect, useState } from 'react';

// Định nghĩa kiểu dữ liệu dựa theo Database của bạn
type Registration = {
  id: number;
  student_name: string;
  student_code: string;
  email: string;
  phone: string;
  topics: {
    title: string;
  };
};

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm tải danh sách sinh viên đã đăng ký
  async function loadRegistrations() {
    setLoading(true);
    try {
      // Lưu ý: Đảm bảo bạn đã có API GET /api/registrations để lấy danh sách này
      const res = await fetch('/api/registrations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      } else {
        console.error('Lỗi khi tải danh sách');
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    } finally {
      setLoading(false);
    }
  }

  // Tự động tải dữ liệu khi vào trang
  useEffect(() => {
    loadRegistrations();
  }, []);

  // Hàm xử lý khi bấm nút Xóa
  async function handleCancel(registrationId: number) {
    const confirmDelete = window.confirm(
      'CẢNH BÁO: Bạn có chắc chắn muốn hủy đăng ký của sinh viên này? Đề tài sẽ tự động được mở lại cho người khác chọn.'
    );
    
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/admin/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationId }), // Chỉ cần gửi registrationId
      });

      const data = await res.json();

      if (res.ok) {
        alert('Thành công: Đã hủy đăng ký và cập nhật đề tài!');
        // Tải lại danh sách ngay lập tức để cập nhật giao diện
        loadRegistrations(); 
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Đã xảy ra lỗi kết nối khi gọi API!');
    }
  }

  return (
    <main className="p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Quản lý Đăng ký Chuyên đề</h1>
        
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3">STT</th>
                  <th className="border border-gray-300 p-3">Mã SV</th>
                  <th className="border border-gray-300 p-3">Họ và Tên</th>
                  <th className="border border-gray-300 p-3">Liên hệ</th>
                  <th className="border border-gray-300 p-3">Đề tài đã chọn</th>
                  <th className="border border-gray-300 p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="border border-gray-300 p-4 text-center text-gray-500">
                      Chưa có sinh viên nào đăng ký.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-3 font-semibold">{reg.student_code}</td>
                      <td className="border border-gray-300 p-3">{reg.student_name}</td>
                      <td className="border border-gray-300 p-3">
                        <div className="text-sm">{reg.email}</div>
                        <div className="text-sm text-gray-600">{reg.phone}</div>
                      </td>
                      <td className="border border-gray-300 p-3 text-sm">
                        {reg.topics?.title || 'Đề tài không tồn tại (Lỗi dữ liệu)'}
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => handleCancel(reg.id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded shadow transition-colors text-sm"
                        >
                          Hủy đăng ký
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
