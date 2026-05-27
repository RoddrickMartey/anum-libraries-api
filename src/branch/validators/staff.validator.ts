import { z } from 'zod';

export const createStaffSchema = z.object({
  firstName: z
    .string({ error: 'First name is required' })
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim(),
  lastName: z
    .string({ error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim(),
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  role: z.enum(
    ['BRANCH_ADMIN', 'SENIOR_LIBRARIAN', 'LIBRARIAN', 'DESK_STAFF'],
    {
      error: 'Invalid role',
    },
  ),
});

export const updateStaffSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  role: z
    .enum(['BRANCH_ADMIN', 'SENIOR_LIBRARIAN', 'LIBRARIAN', 'DESK_STAFF'], {
      error: 'Invalid role',
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character',
    ),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
