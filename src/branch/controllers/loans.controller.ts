import type { Request, Response } from 'express';
import * as loansService from '../services/loans.service.js';
import {
  createLoanSchema,
  checkInSchema,
  renewSchema,
} from '../validators/loans.validator.js';
import logger from '../../shared/logger.js';

export const listActiveLoansByMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const loans = await loansService.getActiveLoansByMember(memberId, branchId);
    res.status(200).json({ data: loans });
  } catch (error) {
    logger.error('Error listing loans', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getLoan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const loan = await loansService.getLoanById(id, branchId);
    res.status(200).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOAN_NOT_FOUND') {
      res.status(404).json({ error: 'Loan not found', code: 'LOAN_NOT_FOUND' });
      return;
    }
    logger.error('Error fetching loan', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const checkOutCopy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createLoanSchema.safeParse(req.body);
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
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const loan = await loansService.checkOutCopy(
      result.data,
      branchId,
      staffId,
    );
    res.status(201).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'COPY_NOT_FOUND') {
      res.status(404).json({ error: 'Copy not found', code: 'COPY_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'COPY_UNAVAILABLE') {
      res
        .status(409)
        .json({ error: 'Copy is not available', code: 'COPY_UNAVAILABLE' });
      return;
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_ACTIVE') {
      res
        .status(409)
        .json({ error: 'Member is not active', code: 'MEMBER_NOT_ACTIVE' });
      return;
    }
    logger.error('Error checking out copy', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const checkInCopy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = checkInSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { loanId } = req.params as { loanId: string };
    const branchId = req.staff?.branchId;
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
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
      res.status(404).json({ error: 'Loan not found', code: 'LOAN_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'LOAN_NOT_ACTIVE') {
      res
        .status(409)
        .json({ error: 'Loan is not active', code: 'LOAN_NOT_ACTIVE' });
      return;
    }
    logger.error('Error checking in copy', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const renewLoan = async (req: Request, res: Response): Promise<void> => {
  const result = renewSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { loanId } = req.params as { loanId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const loan = await loansService.renewLoan(loanId, branchId, result.data);
    res.status(200).json({ data: loan });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOAN_NOT_FOUND') {
      res.status(404).json({ error: 'Loan not found', code: 'LOAN_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'LOAN_NOT_ACTIVE') {
      res
        .status(409)
        .json({ error: 'Loan is not active', code: 'LOAN_NOT_ACTIVE' });
      return;
    }
    logger.error('Error renewing loan', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
