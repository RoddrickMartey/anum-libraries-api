import type { Request, Response } from 'express';
import * as finesService from '../services/fines.service.js';
import { createFineSchema, updateFineSchema } from '../validators/fines.validator.js';
import logger from '../../shared/logger.js';

export const listFinesByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const fines = await finesService.getFinesByMember(memberId, branchId);
    res.status(200).json({ data: fines });
  } catch (error) {
    logger.error('Error listing fines', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getFine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const fine = await finesService.getFineById(id, branchId);
    res.status(200).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      res.status(404).json({ error: 'Fine not found', code: 'FINE_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching fine', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createFine = async (req: Request, res: Response): Promise<void> => {
  const result = createFineSchema.safeParse(req.body);
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
    const staffId = (req as any).staff?.staffId;

    if (!branchId || !staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const fine = await finesService.createFine(result.data, branchId, staffId);
    res.status(201).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res.status(404).json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error creating fine', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateFine = async (req: Request, res: Response): Promise<void> => {
  const result = updateFineSchema.safeParse(req.body);
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

    const fine = await finesService.updateFine(id, branchId, result.data);
    res.status(200).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      res.status(404).json({ error: 'Fine not found', code: 'FINE_NOT_FOUND' });
      return;
    }
    logger.error('Error updating fine', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const waiveFine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await finesService.waivedFine(id, branchId);
    res.status(200).json({ message: 'Fine waived' });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      res.status(404).json({ error: 'Fine not found', code: 'FINE_NOT_FOUND' });
      return;
    }
    logger.error('Error waiving fine', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
