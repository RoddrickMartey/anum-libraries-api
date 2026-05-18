import type { Request, Response } from 'express';
import * as copiesService from '../services/copies.service.js';
import {
  createCopySchema,
  updateCopySchema,
} from '../validators/copies.validator.js';
import logger from '../../shared/logger.js';

export const listCopiesByBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const copies = await copiesService.getCopiesByBook(bookId, branchId);
    res.status(200).json({ data: copies });
  } catch (error) {
    logger.error('Error listing copies', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getCopy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const copy = await copiesService.getCopyById(id, branchId);
    res.status(200).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      res.status(404).json({ error: 'Copy not found', code: 'COPY_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching copy', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createCopy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createCopySchema.safeParse(req.body);
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

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const copy = await copiesService.createCopy(result.data, branchId);
    res.status(201).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'BARCODE_ALREADY_EXISTS') {
      res
        .status(409)
        .json({
          error: 'Barcode already exists',
          code: 'BARCODE_ALREADY_EXISTS',
        });
      return;
    }
    logger.error('Error creating copy', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateCopy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = updateCopySchema.safeParse(req.body);
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

    const copy = await copiesService.updateCopy(id, branchId, result.data);
    res.status(200).json({ data: copy });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      res.status(404).json({ error: 'Copy not found', code: 'COPY_NOT_FOUND' });
      return;
    }
    logger.error('Error updating copy', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
