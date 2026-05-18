import type { Request, Response } from 'express';
import * as auditService from '../services/networkAudit.service.js';
import { auditFilterSchema } from '../validators/networkAudit.validator.js';
import logger from '../../shared/logger.js';

export const getAuditLogs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = auditFilterSchema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    const logs = await auditService.getAuditLogs(result.data);
    res.status(200).json(logs);
  } catch (error) {
    logger.error('Error fetching audit logs', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getAuditLogsByEntity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { entityType, entityId } = req.params;

    if (!entityType || !entityId) {
      res.status(422).json({
        error: 'Entity type and ID are required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const logs = await auditService.getAuditLogsByEntity(entityType, entityId);
    res.status(200).json({ data: logs });
  } catch (error) {
    logger.error('Error fetching audit logs by entity', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getAuditLogsByActor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { actorId } = req.params;

    if (!actorId) {
      res.status(422).json({
        error: 'Actor ID is required',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const logs = await auditService.getAuditLogsByActor(actorId);
    res.status(200).json({ data: logs });
  } catch (error) {
    logger.error('Error fetching audit logs by actor', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
