import type { Request, Response, NextFunction } from 'express';
import * as staffService from '../services/staff.service.js';
import {
  createStaffSchema,
  updateStaffSchema,
  changePasswordSchema,
} from '../validators/staff.validator.js';
import { AppError } from '../../shared/utils/appError.js';

// ─── LIST ALL STAFF ───────────────────────────────────────────────────────────

export const listStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const staff = await staffService.getAllStaff(branchId);
    res.status(200).json({ data: staff });
  } catch (error) {
    next(error);
  }
};

// ─── GET STAFF BY ID ──────────────────────────────────────────────────────────

export const getStaff = async (
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

    const staff = await staffService.getStaffById(id, branchId);
    res.status(200).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      return next(
        new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found'),
      );
    }
    next(error);
  }
};

// ─── CREATE STAFF ─────────────────────────────────────────────────────────────

export const createStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate input
    const result = createStaffSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const createdBy = req.staff?.id;

    if (!branchId || !createdBy) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const staff = await staffService.createStaff(
      result.data,
      branchId,
      createdBy,
    );
    res.status(201).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return next(
        new AppError(
          409,
          'EMAIL_ALREADY_EXISTS',
          'Email address is already in use',
        ),
      );
    }
    next(error);
  }
};

// ─── UPDATE STAFF ─────────────────────────────────────────────────────────────

export const updateStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate input
    const result = updateStaffSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const staff = await staffService.updateStaff(id, branchId, result.data);
    res.status(200).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      return next(
        new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found'),
      );
    }

    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return next(
        new AppError(
          409,
          'EMAIL_ALREADY_EXISTS',
          'Email address is already in use',
        ),
      );
    }
    next(error);
  }
};

// ─── DELETE STAFF ─────────────────────────────────────────────────────────────

export const deleteStaff = async (
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

    await staffService.deleteStaff(id, branchId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      return next(
        new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found'),
      );
    }
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Validate input
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await staffService.changePassword(id, branchId, result.data);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      return next(
        new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found'),
      );
    }
    if (
      error instanceof Error &&
      error.message === 'INVALID_CURRENT_PASSWORD'
    ) {
      return next(
        new AppError(
          401,
          'INVALID_CURRENT_PASSWORD',
          'Current password is incorrect',
        ),
      );
    }
    next(error);
  }
};

// ─── DEACTIVATE STAFF ─────────────────────────────────────────────────────────

export const deactivateStaff = async (
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

    await staffService.deactivateStaff(id, branchId);
    res.status(200).json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      return next(
        new AppError(404, 'STAFF_NOT_FOUND', 'Staff member not found'),
      );
    }
    next(error);
  }
};
