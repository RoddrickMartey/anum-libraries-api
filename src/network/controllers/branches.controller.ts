// src/network/controllers/branches.controller.ts

import type { Request, Response, NextFunction } from 'express';
import * as branchesService from '../services/branches.service.js';
import {
  createBranchSchema,
  updateBranchSchema,
} from '../validators/branches.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listBranches = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const branches = await branchesService.getAllBranches(skip, limit);
    res.status(200).json({ data: branches, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const branch = await branchesService.getBranchById(id);
    res.status(200).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      return next(new AppError(404, 'BRANCH_NOT_FOUND', 'Branch not found'));
    }
    next(error);
  }
};

export const createBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createBranchSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branch = await branchesService.createBranch(result.data);
    res.status(201).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'ADMIN_EMAIL_TAKEN') {
      return next(
        new AppError(
          409,
          'ADMIN_EMAIL_TAKEN',
          'A staff account with that admin email already exists',
        ),
      );
    }
    next(error);
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = updateBranchSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };

    const branch = await branchesService.updateBranch(id, result.data);
    res.status(200).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      return next(new AppError(404, 'BRANCH_NOT_FOUND', 'Branch not found'));
    }
    next(error);
  }
};

export const deactivateBranch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await branchesService.deactivateBranch(id);
    res.status(200).json({ message: 'Branch deactivated successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      return next(new AppError(404, 'BRANCH_NOT_FOUND', 'Branch not found'));
    }
    next(error);
  }
};
