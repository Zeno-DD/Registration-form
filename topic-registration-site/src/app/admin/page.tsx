'use client';
import { useEffect, useState } from 'react';

// Cập nhật Type khớp với dữ liệu bảng
type Registration = {
  id: number;
  student_name: string;
  email: string;
  created_at: string;
  topics?: {
    title: string;
  };
};

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Hàm tải dữ liệu
  async function loadRegistrations() {
    setLoading(true);
    try {
      const res = await fetch('/api/registrations', { cache: 'no-store' });
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  // 2. Hàm xử lý Xóa & Khôi phục đề tài
  async function handleCancel(registrationId: number) {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn hủy đăng ký và mở lại đề tài này?');
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/admin/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });

      if (res.ok) {
        alert('Đã xóa đăng ký thành công!');
        loadRegistrations(); // Tự động làm mới bảng
      } else {
        const data = await res.json();
        alert('Lỗi: ' + data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối API!');
    }
  }

  // Hàm format thời gian giống trong ảnh (VD: 15:03:58 5/11/2026)
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleTimeString('vi-VN')} ${d.toLocaleDateString('vi-VN')}`;
  };

  // Hàm placeholder cho các nút chức năng (bạn hãy copy logic cũ đè vào nếu có)
  const handleExportExcel = () => {
    alert('Chức năng xuất Excel đang được thực thi...');
    // Dán code tải file Excel của bạn vào đây
  };

  const handleLogout = () => {
    // Dán code đăng xuất (VD: router.push('/login') hoặc xóa token) vào đây
    window.location.href = '/'; 
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header: Tiêu đề và nút chức năng */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Quản lý danh sách đăng ký đề tài</h1>
          <div className="flex gap-3">
            <button 
              onClick={handleExportExcel}
              className="bg-[#28a745] hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors"
            >
              Tải file Excel
            </button>
            <button 
              onClick={handleLogout}
              className="bg-[#dc3545] hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold shadow-sm transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-700 text-sm">ID</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Họ tên</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Email</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Đề tài đăng ký</th>
                <th className="p-4 font-semibold text-slate-700 text-sm">Thời gian</th>
                <th className="p-4 font-semibold text-slate-700 text-sm text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">Chưa có sinh viên nào đăng ký.</td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 text-sm">{reg.id}</td>
                    <td className="p-4 text-slate-800 text-sm">{reg.student_name}</td>
                    <td className="p-4 text-slate-600 text-sm">{reg.email}</td>
                    <td className="p-4 text-slate-800 text-sm">{reg.topics?.title || 'Không xác định'}</td>
                    <td className="p-4 text-slate-600 text-sm">{formatDate(reg.created_at)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleCancel(reg.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors shadow-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
