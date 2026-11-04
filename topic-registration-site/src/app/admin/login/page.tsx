// Trong file app/admin/login/page.tsx (hoặc file giao diện login tương ứng)
async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  // ... các đoạn code gọi API đăng nhập hiện tại của bạn ...

  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok) {
    // Đăng nhập thành công thì chuyển hướng ngay về trang quản trị admin
    window.location.href = '/admin'; 
    // Hoặc nếu dùng Next.js router: router.push('/admin');
  } else {
    // Hiển thị lỗi nếu có
    setMessage('Đăng nhập thất bại.');
  }
}
