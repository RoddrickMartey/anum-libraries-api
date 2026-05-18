import type { Request, Response } from 'express';
import * as networkBansService from '../services/networkBans.service.js';
import {
  createNetworkBanSchema,
  revokeNetworkBanSchema,
} from '../validators/networkBans.validator.js';
import logger from '../../shared/logger.js';

export const listNetworkBansByMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { memberId } = req.params;

    const bans = await networkBansService.getNetworkBansByMember(memberId);
    res.status(200).json({ data: bans });
  } catch (error) {
    logger.error('Error listing network bans', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createNetworkBan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createNetworkBanSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const staffId = (req as any).staff?.staffId;

    if (!staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const ban = await networkBansService.createNetworkBan(result.data, staffId);
    res.status(201).json({ data: ban });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error creating network ban', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const revokeNetworkBan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = revokeNetworkBanSchema.safeParse(req.body);
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
    const staffId = (req as any).staff?.staffId;

    if (!staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await networkBansService.revokeNetworkBan(banId, result.data, staffId);
    res.status(200).json({ message: 'Network ban revoked successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'BAN_NOT_FOUND') {
      res.status(404).json({ error: 'Ban not found', code: 'BAN_NOT_FOUND' });
      return;
    }
    logger.error('Error revoking network ban', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
