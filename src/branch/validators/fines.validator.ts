import { z } from 'zod';

export const createFineSchema = z.object({
  memberId: z
    .string({ error: 'Member ID is required' })
    .uuid('Invalid member ID'),
  type: z.enum(['OVERDUE', 'DAMAGED', 'LOST', 'OTHER'], {
    error: 'Invalid fine type',
  }),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  reason: z.string().optional(),
  loanId: z.string().uuid('Invalid loan ID').optional(),
});

export const updateFineSchema = z.object({
  status: z
    .enum(['OUTSTANDING', 'PARTIALLY_PAID', 'PAID', 'WAIVED'])
    .optional(),
  amountPaid: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Amount paid must be a non-negative number',
    })
    .optional(),
});

export type CreateFineInput = z.infer<typeof createFineSchema>;
export type UpdateFineInput = z.infer<typeof updateFineSchema>;
