'use client';

import { useState, useEffect } from 'react';

interface Registration {
  id: string;
  fullName: string;
  email: string;
  topic: string;
  createdAt: string;
}

export default function AdminPage() {
  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Đã sửa: Tự động gọi API lấy dữ liệu từ Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/registrations', { cache: 'no-store' });
        if (res.ok) {
          const result = await res.json();
          // Chuyển đổi tên trường từ Backend (student_name) sang Frontend (fullName)
          const formattedData = result.map((item: any) => ({
            id: item.id,
            fullName: item.student_name,
            email: item.email,
            topic: item.topic_title || 'Chưa có tên đề tài',
            createdAt: new Date(item.created_at).toLocaleString('vi-VN')
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
    }
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Danh-sach-dang-ky.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Tải file thất bại.');
      }
    } catch {
      alert('Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_logged_in=; path=/; max-age=0';
    window.location.href = '/admin/login';
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Quản lý danh sách đăng ký đề tài</h1>
        <div>
          <button
            onClick={handleExportExcel}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem', fontWeight: 'bold' }}
          >
            {loading ? 'Đang tải xuống...' : 'Tải file Excel'}
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem 1rem' }}>ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>Họ tên</th>
              <th style={{ padding: '0.75rem 1rem' }}>Email</th>
              <th style={{ padding: '0.75rem 1rem' }}>Đề tài đăng ký</th>
              <th style={{ padding: '0.75rem 1rem' }}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  Chưa có dữ liệu đăng ký nào.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.id}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.fullName}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.topic}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{item.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
