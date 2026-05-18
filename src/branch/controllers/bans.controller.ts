import type { Request, Response } from 'express';
import * as bansService from '../services/bans.service.js';
import { createBanSchema, revokeBanSchema } from '../validators/bans.validator.js';
import logger from '../../shared/logger.js';

export const listBansByMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const branchId = (req as any).staff?.branchId;

    const bans = await bansService.getBansByMember(memberId, branchId);
    res.status(200).json({ data: bans });
  } catch (error) {
    logger.error('Error listing bans', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createBan = async (req: Request, res: Response): Promise<void> => {
  const result = createBanSchema.safeParse(req.body);
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

    const ban = await bansService.createBan(result.data, branchId, staffId);
    res.status(201).json({ data: ban });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res.status(404).json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error creating ban', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const revokeBan = async (req: Request, res: Response): Promise<void> => {
  const result = revokeBanSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { banId } = req.params;
    const branchId = (req as any).staff?.branchId;
    const staffId = (req as any).staff?.staffId;

    if (!branchId || !staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await bansService.revokeBan(banId, branchId, result.data, staffId);
    res.status(200).json({ message: 'Ban revoked' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAN_NOT_FOUND') {
      res.status(404).json({ error: 'Ban not found', code: 'BAN_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      res.status(403).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }
    logger.error('Error revoking ban', { error });
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
