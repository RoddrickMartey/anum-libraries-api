import { z } from 'zod';

export const createBookSchema = z.object({
  isbn: z
    .string({ error: 'ISBN is required' })
    .min(10, 'ISBN must be at least 10 characters')
    .max(20, 'ISBN must be at most 20 characters')
    .trim(),
  title: z
    .string({ error: 'Title is required' })
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters')
    .trim(),
  authors: z.array(z.string().trim()).min(1, 'At least one author is required'),
  publisher: z.string().max(100).trim().optional(),
  publishedYear: z
    .number()
    .int()
    .min(1000, 'Published year must be valid')
    .max(new Date().getFullYear() + 1)
    .optional(),
  edition: z.string().max(50).trim().optional(),
  language: z.string().max(20).trim().optional().default('en'),
  genre: z.string().max(50).trim().optional(),
  description: z.string().optional(),
  shelfLocation: z.string().max(50).trim().optional(),
});

export const updateBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters')
    .trim()
    .optional(),
  authors: z
    .array(z.string().trim())
    .min(1, 'At least one author is required')
    .optional(),
  publisher: z.string().max(100).trim().optional(),
  publishedYear: z
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear() + 1)
    .optional(),
  edition: z.string().max(50).trim().optional(),
  language: z.string().max(20).trim().optional(),
  genre: z.string().max(50).trim().optional(),
  description: z.string().optional(),
  shelfLocation: z.string().max(50).trim().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
