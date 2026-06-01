import type { Request, Response, NextFunction } from 'express';
import * as networkBansService from '../services/networkBans.service.js';
import {
  createNetworkBanSchema,
  revokeNetworkBanSchema,
} from '../validators/networkBans.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listNetworkBansByMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };

    const bans = await networkBansService.getNetworkBansByMember(memberId);
    res.status(200).json({ data: bans });
  } catch (error) {
    next(error);
  }
};

export const createNetworkBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createNetworkBanSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const staffId = req.staff?.id;

    if (!staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const ban = await networkBansService.createNetworkBan(result.data, staffId);
    res.status(201).json({ data: ban });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const revokeNetworkBan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = revokeNetworkBanSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { banId } = req.params as { banId: string };
    const staffId = req.staff?.id;

    if (!staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await networkBansService.revokeNetworkBan(banId, result.data, staffId);
    res.status(200).json({ message: 'Network ban revoked successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAN_NOT_FOUND') {
      return next(new AppError(404, 'BAN_NOT_FOUND', 'Ban not found'));
    }
    next(error);
  }
};
