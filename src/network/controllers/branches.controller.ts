// src/network/controllers/branches.controller.ts

import type { Request, Response } from 'express';
import * as branchesService from '../services/branches.service.js';
import {
  createBranchSchema,
  updateBranchSchema,
} from '../validators/branches.validator.js';
import logger from '../../shared/logger.js';

export const listBranches = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const branches = await branchesService.getAllBranches(skip, limit);
    res.status(200).json({ data: branches, pagination: { page, limit } });
  } catch (error) {
    logger.error('Error listing branches', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const branch = await branchesService.getBranchById(id);
    res.status(200).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Branch not found', code: 'BRANCH_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching branch', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createBranch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createBranchSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const branch = await branchesService.createBranch(result.data);
    res.status(201).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'ADMIN_EMAIL_TAKEN') {
      res.status(409).json({
        error: 'A staff account with that admin email already exists',
        code: 'ADMIN_EMAIL_TAKEN',
      });
      return;
    }
    logger.error('Error creating branch', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

export const updateBranch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = updateBranchSchema.safeParse(req.body);
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

    const branch = await branchesService.updateBranch(id, result.data);
    res.status(200).json({ data: branch });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Branch not found', code: 'BRANCH_NOT_FOUND' });
      return;
    }
    logger.error('Error updating branch', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const deactivateBranch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    await branchesService.deactivateBranch(id);
    res.status(200).json({ message: 'Branch deactivated successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BRANCH_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Branch not found', code: 'BRANCH_NOT_FOUND' });
      return;
    }
    logger.error('Error deactivating branch', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
