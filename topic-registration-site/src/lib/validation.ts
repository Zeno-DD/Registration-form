import { z } from 'zod';

export const registrationSchema = z.object({
  studentName: z.string().trim().min(1).max(120),
  studentCode: z.string().trim().min(1).max(30), // Đã hạ xuống min(1) để bạn nhập số 1 test thoải mái
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^[0-9+(). -]{8,20}$/),
  topicId: z.string().min(1), // Đã bỏ .uuid() để chấp nhận ID số nguyên (int4) từ database
});
