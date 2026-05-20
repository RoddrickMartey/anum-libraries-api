import type { Request, Response } from 'express';
import * as staffService from '../services/staff.service.js';
import {
  createStaffSchema,
  updateStaffSchema,
  changePasswordSchema,
} from '../validators/staff.validator.js';
import logger from '../../shared/logger.js';

// ─── LIST ALL STAFF ───────────────────────────────────────────────────────────

export const listStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    const staff = await staffService.getAllStaff(branchId);
    res.status(200).json({ data: staff });
  } catch (error) {
    logger.error('Error listing staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── GET STAFF BY ID ──────────────────────────────────────────────────────────

export const getStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    const staff = await staffService.getStaffById(id, branchId);
    res.status(200).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }

    logger.error('Error fetching staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── CREATE STAFF ─────────────────────────────────────────────────────────────

export const createStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate input
  const result = createStaffSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const branchId = req.staff?.branchId;
    const createdBy = req.staff?.id;

    if (!branchId || !createdBy) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    const staff = await staffService.createStaff(
      result.data,
      branchId,
      createdBy,
    );
    res.status(201).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({
        error: 'Email address is already in use',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    logger.error('Error creating staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── UPDATE STAFF ─────────────────────────────────────────────────────────────

export const updateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate input
  const result = updateStaffSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    const staff = await staffService.updateStaff(id, branchId, result.data);
    res.status(200).json({ data: staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }

    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({
        error: 'Email address is already in use',
        code: 'EMAIL_ALREADY_EXISTS',
      });
      return;
    }

    logger.error('Error updating staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── DELETE STAFF ─────────────────────────────────────────────────────────────

export const deleteStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    await staffService.deleteStaff(id, branchId);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }

    logger.error('Error deleting staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Validate input
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    await staffService.changePassword(id, branchId, result.data);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }

    if (
      error instanceof Error &&
      error.message === 'INVALID_CURRENT_PASSWORD'
    ) {
      res.status(401).json({
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD',
      });
      return;
    }

    logger.error('Error changing password', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── DEACTIVATE STAFF ─────────────────────────────────────────────────────────

export const deactivateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });
      return;
    }

    await staffService.deactivateStaff(id, branchId);
    res.status(200).json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }

    logger.error('Error deactivating staff', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};
