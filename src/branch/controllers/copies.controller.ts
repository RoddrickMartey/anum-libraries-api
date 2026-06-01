import type { Request, Response, NextFunction } from 'express';
import * as copiesService from '../services/copies.service.js';
import {
  createCopySchema,
  updateCopySchema,
} from '../validators/copies.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listCopiesByBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { bookId } = req.params as { bookId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const copies = await copiesService.getCopiesByBook(bookId, branchId);
    res.status(200).json({ data: copies });
  } catch (error) {
    next(error);
  }
};

export const getCopy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const copy = await copiesService.getCopyById(id, branchId);
    res.status(200).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      return next(new AppError(404, 'COPY_NOT_FOUND', 'Copy not found'));
    }
    next(error);
  }
};

export const createCopy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createCopySchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const copy = await copiesService.createCopy(result.data, branchId);
    res.status(201).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      return next(new AppError(404, 'BOOK_NOT_FOUND', 'Book not found'));
    }
    if (error instanceof Error && error.message === 'BARCODE_ALREADY_EXISTS') {
      return next(
        new AppError(409, 'BARCODE_ALREADY_EXISTS', 'Barcode already exists'),
      );
    }
    next(error);
  }
};

export const updateCopy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = updateCopySchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const copy = await copiesService.updateCopy(id, branchId, result.data);
    res.status(200).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      return next(new AppError(404, 'COPY_NOT_FOUND', 'Copy not found'));
    }
    next(error);
  }
};
