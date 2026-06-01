import type { Request, Response, NextFunction } from 'express';
import * as loansService from '../services/loans.service.js';
import {
  createLoanSchema,
  checkInSchema,
  renewSchema,
} from '../validators/loans.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listActiveLoansByMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const loans = await loansService.getActiveLoansByMember(memberId, branchId);
    res.status(200).json({ data: loans });
  } catch (error) {
    next(error);
  }
};

export const getLoan = async (
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

    const loan = await loansService.getLoanById(id, branchId);
    res.status(200).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOAN_NOT_FOUND') {
      return next(new AppError(404, 'LOAN_NOT_FOUND', 'Loan not found'));
    }
    next(error);
  }
};

export const checkOutCopy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createLoanSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const loan = await loansService.checkOutCopy(
      result.data,
      branchId,
      staffId,
    );
    res.status(201).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      return next(new AppError(404, 'COPY_NOT_FOUND', 'Copy not found'));
    }
    if (error instanceof Error && error.message === 'COPY_UNAVAILABLE') {
      return next(
        new AppError(409, 'COPY_UNAVAILABLE', 'Copy is not available'),
      );
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_ACTIVE') {
      return next(
        new AppError(409, 'MEMBER_NOT_ACTIVE', 'Member is not active'),
      );
    }
    next(error);
  }
};

export const checkInCopy = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = checkInSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { loanId } = req.params as { loanId: string };
    const branchId = req.staff?.branchId;
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const loan = await loansService.checkInCopy(
      loanId,
      branchId,
      result.data,
      staffId,
    );
    res.status(200).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOAN_NOT_FOUND') {
      return next(new AppError(404, 'LOAN_NOT_FOUND', 'Loan not found'));
    }
    if (error instanceof Error && error.message === 'LOAN_NOT_ACTIVE') {
      return next(new AppError(409, 'LOAN_NOT_ACTIVE', 'Loan is not active'));
    }
    next(error);
  }
};

export const renewLoan = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = renewSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const { loanId } = req.params as { loanId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const loan = await loansService.renewLoan(loanId, branchId, result.data);
    res.status(200).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOAN_NOT_FOUND') {
      return next(new AppError(404, 'LOAN_NOT_FOUND', 'Loan not found'));
    }
    if (error instanceof Error && error.message === 'LOAN_NOT_ACTIVE') {
      return next(new AppError(409, 'LOAN_NOT_ACTIVE', 'Loan is not active'));
    }
    next(error);
  }
};
