import { z } from 'zod';

export const auditFilterSchema = z.object({
  entityType: z.string().optional(),
  branchId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => Math.max(1, parseInt(val || '1'))),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(100, parseInt(val || '20'))),
});

export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
