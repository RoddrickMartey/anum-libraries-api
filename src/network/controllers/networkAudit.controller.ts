import type { Request, Response, NextFunction } from 'express';
import * as auditService from '../services/networkAudit.service.js';
import { auditFilterSchema } from '../validators/networkAudit.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = auditFilterSchema.safeParse(req.query);
    if (!result.success) {
      throw result.error;
    }

    const logs = await auditService.getAuditLogs(result.data);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsByEntity = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { entityType, entityId } = req.params as {
      entityType: string;
      entityId: string;
    };

    if (!entityType || !entityId) {
      throw new AppError(
        422,
        'VALIDATION_ERROR',
        'Entity type and ID are required',
      );
    }

    const logs = await auditService.getAuditLogsByEntity(entityType, entityId);
    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogsByActor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { actorId } = req.params as { actorId: string };

    if (!actorId) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Actor ID is required');
    }

    const logs = await auditService.getAuditLogsByActor(actorId);
    res.status(200).json({ data: logs });
  } catch (error) {
    next(error);
  }
};
