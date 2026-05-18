import { z } from 'zod';

export const createCopySchema = z.object({
  bookId: z.string({ error: 'Book ID is required' }).uuid('Invalid book ID'),
  barcode: z
    .string({ error: 'Barcode is required' })
    .min(1, 'Barcode is required')
    .max(50)
    .trim(),
  condition: z.string().max(100).trim().optional(),
  acquiredAt: z.coerce.date().optional(),
});

export const updateCopySchema = z.object({
  status: z
    .enum(['AVAILABLE', 'BORROWED', 'RESERVED', 'DAMAGED', 'LOST', 'WITHDRAWN'])
    .optional(),
  condition: z.string().max(100).trim().optional(),
});

export type CreateCopyInput = z.infer<typeof createCopySchema>;
export type UpdateCopyInput = z.infer<typeof updateCopySchema>;
