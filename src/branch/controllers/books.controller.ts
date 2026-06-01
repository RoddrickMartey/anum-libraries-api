import type { Request, Response, NextFunction } from 'express';
import * as booksService from '../services/books.service.js';
import {
  createBookSchema,
  updateBookSchema,
} from '../validators/books.validator.js';
import logger from '../../shared/logger.js';
import { AppError } from '../../shared/utils/appError.js';

export const listBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const branchId = req.staff?.branchId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const books = await booksService.getAllBooks(branchId, skip, limit);
    res.status(200).json({ data: books, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (
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

    const book = await booksService.getBookById(id, branchId);
    res.status(200).json({ data: book });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      return next(new AppError(404, 'BOOK_NOT_FOUND', 'Book not found'));
    }
    next(error);
  }
};

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createBookSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const createdBy = req.staff?.id;

    if (!branchId || !createdBy) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const book = await booksService.createBook(
      result.data,
      branchId,
      createdBy,
    );
    res.status(201).json({ data: book });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = updateBookSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const book = await booksService.updateBook(id, branchId, result.data);
    res.status(200).json({ data: book });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      return next(new AppError(404, 'BOOK_NOT_FOUND', 'Book not found'));
    }
    next(error);
  }
};

export const deleteBook = async (
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

    await booksService.deleteBook(id, branchId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      return next(new AppError(404, 'BOOK_NOT_FOUND', 'Book not found'));
    }
    next(error);
  }
};
