// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../shared/utils/appError.js';

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // 1. Handle Custom Operational AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.meta && { meta: err.meta }),
    });
  }

  // 2. Handle Zod Validation Errors (Flattened to match { [key: string]: string })
  if (err instanceof ZodError) {
    const flattenedMeta: { [key: string]: string } = {};
    err.issues.forEach((e) => {
      const fieldName = e.path.join('.') || 'body';
      flattenedMeta[fieldName] = e.message;
    });

    return res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      meta: flattenedMeta,
    });
  }

  // 3. Handle Prisma Database Errors Dynamically
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    const code = typeof e.code === 'string' ? e.code : undefined;

    if (code && code.startsWith('P')) {
      const meta = e.meta as Record<string, unknown> | undefined;

      if (code === 'P2002') {
        return res.status(404).json({
          error: 'The requested database record could not be found.',
          code: 'NOT_FOUND',
          meta: {
            cause: String(meta?.cause ?? 'Record missing'),
            target: Array.isArray(meta?.target)
              ? (meta.target as unknown[]).join(', ')
              : String(meta?.target ?? 'unknown_field'),
          },
        });
      }

      if (code === 'P2025') {
        return res.status(404).json({
          error: 'The requested database record could not be found.',
          code: 'NOT_FOUND',
          meta: { cause: String(meta?.cause ?? 'Record missing') },
        });
      }

      return res.status(400).json({
        error: 'Database operation failure',
        code: `DB_ERROR_${code}`,
        meta: { prismaCode: code },
      });
    }
  }

  // 4. Fallback for unhandled developer bugs / system exceptions
  console.error('💥 UNEXPECTED CRASH:', err);

  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    meta: null,
  });
};
