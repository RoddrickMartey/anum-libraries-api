import type { Request, Response, NextFunction } from 'express';
import * as finesService from '../services/fines.service.js';
import {
  createFineSchema,
  updateFineSchema,
} from '../validators/fines.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listFinesByMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const fines = await finesService.getFinesByMember(memberId, branchId);
    res.status(200).json({ data: fines });
  } catch (error) {
    next(error);
  }
};

export const getFine = async (
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

    const fine = await finesService.getFineById(id, branchId);
    res.status(200).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      return next(new AppError(404, 'FINE_NOT_FOUND', 'Fine not found'));
    }
    next(error);
  }
};

export const createFine = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createFineSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const fine = await finesService.createFine(result.data, branchId, staffId);
    res.status(201).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const updateFine = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = updateFineSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const fine = await finesService.updateFine(id, branchId, result.data);
    res.status(200).json({ data: fine });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      return next(new AppError(404, 'FINE_NOT_FOUND', 'Fine not found'));
    }
    next(error);
  }
};

export const waiveFine = async (
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

    await finesService.waivedFine(id, branchId);
    res.status(200).json({ message: 'Fine waived' });
  } catch (error) {
    if (error instanceof Error && error.message === 'FINE_NOT_FOUND') {
      return next(new AppError(404, 'FINE_NOT_FOUND', 'Fine not found'));
    }
    next(error);
  }
};
