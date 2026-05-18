import { z } from 'zod';

export const createBanSchema = z.object({
  memberId: z
    .string({ error: 'Member ID is required' })
    .uuid('Invalid member ID'),
  type: z.enum(['BRANCH', 'NETWORK'], { error: 'Invalid ban type' }),
  reason: z
    .string({ error: 'Reason is required' })
    .min(1, 'Reason is required'),
  legalReference: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const revokeBanSchema = z.object({
  revokeReason: z.string().optional(),
});

export type CreateBanInput = z.infer<typeof createBanSchema>;
export type RevokeBanInput = z.infer<typeof revokeBanSchema>;
