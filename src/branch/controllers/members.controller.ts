import type { Request, Response } from 'express';
import * as membersService from '../services/members.service.js';
import {
  createMemberSchema,
  updateMemberSchema,
} from '../validators/members.validator.js';
import logger from '../../shared/logger.js';

export const listMembers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const branchId = req.staff?.branchId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const members = await membersService.getAllMembers(branchId, skip, limit);
    res.status(200).json({ data: members, pagination: { page, limit } });
  } catch (error) {
    logger.error('Error listing members', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const member = await membersService.getMemberById(id, branchId);
    res.status(200).json({ data: member });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching member', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createMemberSchema.safeParse(req.body);
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
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const member = await membersService.createMember(
      result.data,
      branchId,
      createdBy,
    );
    res.status(201).json({ data: member });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'CARD_NUMBER_ALREADY_EXISTS'
    ) {
      res.status(409).json({
        error: 'Card number already exists',
        code: 'CARD_NUMBER_ALREADY_EXISTS',
      });
      return;
    }
    logger.error('Error creating member', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = updateMemberSchema.safeParse(req.body);
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
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const member = await membersService.updateMember(id, branchId, result.data);
    res.status(200).json({ data: member });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error updating member', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const suspendMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await membersService.suspendMember(id, branchId);
    res.status(200).json({ message: 'Member suspended successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error suspending member', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
