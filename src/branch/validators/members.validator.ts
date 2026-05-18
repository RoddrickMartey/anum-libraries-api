import { z } from 'zod';

export const createMemberSchema = z.object({
  cardNumber: z
    .string({ error: 'Card number is required' })
    .min(1, 'Card number is required')
    .max(50)
    .trim(),
  firstName: z
    .string({ error: 'First name is required' })
    .min(1, 'First name is required')
    .max(50)
    .trim(),
  lastName: z
    .string({ error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50)
    .trim(),
  dateOfBirth: z.coerce.date().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  cardExpiresAt: z.coerce.date({ error: 'Card expiry date is required' }),
  notes: z.string().optional(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.string().email('Invalid email').optional(),
  address: z.string().optional(),
  cardExpiresAt: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'EXPIRED']).optional(),
  notes: z.string().optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
