import { z } from 'zod';

export const createReservationSchema = z.object({
  bookId: z.string({ error: 'Book ID is required' }).uuid('Invalid book ID'),
  memberId: z
    .string({ error: 'Member ID is required' })
    .uuid('Invalid member ID'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
