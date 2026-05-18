import { z } from 'zod';

export const createNetworkBanSchema = z.object({
  memberId: z.uuid('Member ID is required'),
  reason: z
    .string({ error: 'Reason is required' })
    .min(1, 'Reason is required'),
  legalReference: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const revokeNetworkBanSchema = z.object({
  revokeReason: z.string().optional(),
});

export type CreateNetworkBanInput = z.infer<typeof createNetworkBanSchema>;
export type RevokeNetworkBanInput = z.infer<typeof revokeNetworkBanSchema>;
