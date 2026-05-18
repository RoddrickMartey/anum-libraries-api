import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  cookies: z.object({
    anum_refresh_token: z.string({ error: 'Refresh token is required' }),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
