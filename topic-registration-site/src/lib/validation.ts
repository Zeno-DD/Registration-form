import { z } from 'zod';

export const registrationSchema = z.object({
  studentName: z.string().trim().min(1).max(120),
  studentCode: z.string().trim().regex(/^[A-Za-z]{2,3}\d{6}$/), // ví dụ AT200314
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^[0-9+(). -]{8,20}$/),
  topicId: z.string().min(1),
});
