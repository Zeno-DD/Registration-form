import { z } from 'zod';

export const registrationSchema = z.object({
  studentName: z.string().trim().min(2).max(120),
  studentCode: z.string().trim().min(4).max(30),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().regex(/^[0-9+(). -]{8,20}$/),
  topicId: z.string().uuid(),
});
