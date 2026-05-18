import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateLoanInput,
  CheckInInput,
  RenewInput,
} from '../validators/loans.validator.js';

export const getActiveLoansByMember = async (
  memberId: string,
  branchId: string,
) => {
  const loans = await prisma.loan.findMany({
    where: { memberId, branchId, status: 'ACTIVE' },
    include: {
      copy: {
        select: { barcode: true, book: { select: { title: true } } },
      },
    },
    orderBy: { dueAt: 'asc' },
  });

  return loans;
};

export const getLoanById = async (loanId: string, branchId: string) => {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, branchId },
    include: {
      copy: {
        select: { barcode: true, book: { select: { id: true, title: true } } },
      },
      member: {
        select: { id: true, firstName: true, lastName: true, cardNumber: true },
      },
      fines: { select: { id: true, amount: true, status: true } },
    },
  });

  if (!loan) {
    throw new Error('LOAN_NOT_FOUND');
  }

  return loan;
};

export const checkOutCopy = async (
  input: CreateLoanInput,
  branchId: string,
  staffId: string,
) => {
  const copy = await prisma.copy.findFirst({
    where: { id: input.copyId, branchId },
  });

  if (!copy) {
    throw new Error('COPY_NOT_FOUND');
  }

  if (copy.status !== 'AVAILABLE') {
    throw new Error('COPY_UNAVAILABLE');
  }

  const member = await prisma.member.findFirst({
    where: { id: input.memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  if (member.status !== 'ACTIVE') {
    throw new Error('MEMBER_NOT_ACTIVE');
  }

  const loan = await prisma.loan.create({
    data: {
      branchId,
      copyId: input.copyId,
      memberId: input.memberId,
      dueAt: input.dueAt,
      checkedOutBy: staffId,
    },
    include: {
      copy: { select: { barcode: true } },
      member: { select: { cardNumber: true } },
    },
  });

  await prisma.copy.update({
    where: { id: input.copyId },
    data: { status: 'BORROWED' },
  });

  logger.info('Copy checked out', { loanId: loan.id, copyId: input.copyId });
  return loan;
};

export const checkInCopy = async (
  loanId: string,
  branchId: string,
  input: CheckInInput,
  staffId: string,
) => {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, branchId },
  });

  if (!loan) {
    throw new Error('LOAN_NOT_FOUND');
  }

  if (loan.status !== 'ACTIVE') {
    throw new Error('LOAN_NOT_ACTIVE');
  }

  const updatedLoan = await prisma.loan.update({
    where: { id: loanId },
    data: {
      returnedAt: new Date(),
      checkedInBy: staffId,
      status: 'RETURNED',
    },
    include: { copy: { select: { id: true, barcode: true } } },
  });

  await prisma.copy.update({
    where: { id: loan.copyId },
    data: { status: 'AVAILABLE', condition: input.condition },
  });

  logger.info('Copy checked in', { loanId });
  return updatedLoan;
};

export const renewLoan = async (
  loanId: string,
  branchId: string,
  input: RenewInput,
) => {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, branchId },
  });

  if (!loan) {
    throw new Error('LOAN_NOT_FOUND');
  }

  if (loan.status !== 'ACTIVE') {
    throw new Error('LOAN_NOT_ACTIVE');
  }

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: {
      renewalCount: (loan.renewalCount || 0) + 1,
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info('Loan renewed', { loanId });
  return updated;
};
