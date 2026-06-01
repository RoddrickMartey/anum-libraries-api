import type { Request, Response, NextFunction } from 'express';
import * as membersService from '../services/members.service.js';
import {
  createMemberSchema,
  updateMemberSchema,
} from '../validators/members.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const branchId = req.staff?.branchId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const members = await membersService.getAllMembers(branchId, skip, limit);
    res.status(200).json({ data: members, pagination: { page, limit } });
  } catch (error) {
    next(error);
  }
};

export const getMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const member = await membersService.getMemberById(id, branchId);
    res.status(200).json({ data: member });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const createMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createMemberSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const createdBy = req.staff?.id;

    if (!branchId || !createdBy) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
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
      return next(
        new AppError(
          409,
          'CARD_NUMBER_ALREADY_EXISTS',
          'Card number already exists',
        ),
      );
    }
    next(error);
  }
};

export const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = updateMemberSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const member = await membersService.updateMember(id, branchId, result.data);
    res.status(200).json({ data: member });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const suspendMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await membersService.suspendMember(id, branchId);
    res.status(200).json({ message: 'Member suspended successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};
