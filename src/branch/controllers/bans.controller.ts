import type { Request, Response, NextFunction } from 'express';
import * as bansService from '../services/bans.service.js';
import {
  createBanSchema,
  revokeBanSchema,
} from '../validators/bans.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listBansByMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };
    const branchId = req.staff?.branchId as string;

    const bans = await bansService.getBansByMember(memberId, branchId);
    res.status(200).json({ data: bans });
  } catch (error) {
    next(error);
  }
};

export const createBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createBanSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId as string;
    const staffId = req.staff?.id as string;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const ban = await bansService.createBan(result.data, branchId, staffId);
    res.status(201).json({ data: ban });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const revokeBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = revokeBanSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { banId } = req.params as { banId: string };
    const branchId = req.staff?.branchId as string;
    const staffId = req.staff?.id as string;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await bansService.revokeBan(banId, branchId, result.data, staffId);
    res.status(200).json({ message: 'Ban revoked' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAN_NOT_FOUND') {
      return next(new AppError(404, 'BAN_NOT_FOUND', 'Ban not found'));
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return next(new AppError(403, 'UNAUTHORIZED', 'Unauthorized'));
    }
    next(error);
  }
};
