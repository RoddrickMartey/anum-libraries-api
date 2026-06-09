import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('Invalid email address')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),
});

export const refreshSchema = z.object({
  cookies: z.object({
    anum_refresh_token: z.string({ error: 'Refresh token is required' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
