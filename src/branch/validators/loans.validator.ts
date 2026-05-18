import { z } from 'zod';

export const createLoanSchema = z.object({
  copyId: z.string({ error: 'Copy ID is required' }).uuid('Invalid copy ID'),
  memberId: z
    .string({ error: 'Member ID is required' })
    .uuid('Invalid member ID'),
  dueAt: z.coerce.date({ error: 'Due date is required' }),
});

export const checkInSchema = z.object({
  condition: z.string().max(100).trim().optional(),
});

export const renewSchema = z.object({
  renewalCount: z.number().int().min(0).optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type RenewInput = z.infer<typeof renewSchema>;
