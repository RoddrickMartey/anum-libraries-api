import type { Request, Response } from 'express';
import * as booksService from '../services/books.service.js';
import {
  createBookSchema,
  updateBookSchema,
} from '../validators/books.validator.js';
import logger from '../../shared/logger.js';

export const listBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = (req as any).staff?.branchId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const books = await booksService.getAllBooks(branchId, skip, limit);
    res.status(200).json({ data: books, pagination: { page, limit } });
  } catch (error) {
    logger.error('Error listing books', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const book = await booksService.getBookById(id, branchId);
    res.status(200).json({ data: book });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching book', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createBookSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const branchId = (req as any).staff?.branchId;
    const createdBy = (req as any).staff?.staffId;

    if (!branchId || !createdBy) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const book = await booksService.createBook(
      result.data,
      branchId,
      createdBy,
    );
    res.status(201).json({ data: book });
  } catch (error) {
    logger.error('Error creating book', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = updateBookSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const book = await booksService.updateBook(id, branchId, result.data);
    res.status(200).json({ data: book });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' });
      return;
    }
    logger.error('Error updating book', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await booksService.deleteBook(id, branchId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' });
      return;
    }
    logger.error('Error deleting book', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
