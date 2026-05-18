import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z
    .string({ error: 'Branch name is required' })
    .min(1, 'Branch name is required')
    .max(100, 'Branch name must be at most 100 characters')
    .trim(),
  town: z
    .string({ error: 'Town is required' })
    .min(1, 'Town is required')
    .max(100, 'Town must be at most 100 characters')
    .trim(),
  address: z
    .string({ error: 'Address is required' })
    .min(1, 'Address is required')
    .max(255, 'Address must be at most 255 characters')
    .trim(),
  phone: z.string().max(20).trim().optional(),
  email: z.email('Invalid email address').optional(),
  loanRules: z.record(z.string(), z.any()).optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100).trim().optional(),
  town: z.string().min(1).max(100).trim().optional(),
  address: z.string().min(1).max(255).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  email: z.email('Invalid email address').optional(),
  isActive: z.boolean().optional(),
  loanRules: z.record(z.string(), z.any()).optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
