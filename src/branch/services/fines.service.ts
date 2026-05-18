import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type { CreateFineInput, UpdateFineInput } from '../validators/fines.validator.js';

export const getFinesByMember = async (memberId: string, branchId: string) => {
  const fines = await prisma.fine.findMany({
    where: { memberId, branchId },
    select: {
      id: true,
      type: true,
      amount: true,
      amountPaid: true,
      status: true,
      reason: true,
      issuedAt: true,
    },
    orderBy: { issuedAt: 'desc' },
  });

  return fines;
};

export const getFineById = async (fineId: string, branchId: string) => {
  const fine = await prisma.fine.findFirst({
    where: { id: fineId, branchId },
    include: {
      member: { select: { id: true, firstName: true, lastName: true } },
      loan: { select: { id: true, returnedAt: true } },
    },
  });

  if (!fine) {
    throw new Error('FINE_NOT_FOUND');
  }

  return fine;
};

export const createFine = async (input: CreateFineInput, branchId: string, staffId: string) => {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  const fine = await prisma.fine.create({
    data: {
      branchId,
      memberId: input.memberId,
      loanId: input.loanId,
      type: input.type,
      amount: parseFloat(input.amount),
      reason: input.reason,
      actionBy: staffId,
    },
    select: {
      id: true,
      type: true,
      amount: true,
      status: true,
      issuedAt: true,
    },
  });

  logger.info('Fine created', { fineId: fine.id, branchId });
  return fine;
};

export const updateFine = async (fineId: string, branchId: string, input: UpdateFineInput) => {
  const fine = await prisma.fine.findFirst({
    where: { id: fineId, branchId },
  });

  if (!fine) {
    throw new Error('FINE_NOT_FOUND');
  }

  const fine_update: any = {};
  if (input.status) fine_update.status = input.status;
  if (input.amountPaid !== undefined) {
    fine_update.amountPaid = parseFloat(input.amountPaid);
    if (parseFloat(input.amountPaid) >= Number(fine.amount)) {
      fine_update.status = 'PAID';
      fine_update.settledAt = new Date();
    } else if (parseFloat(input.amountPaid) > 0) {
      fine_update.status = 'PARTIALLY_PAID';
    }
  }

  const updated = await prisma.fine.update({
    where: { id: fineId },
    data: fine_update,
    select: {
      id: true,
      type: true,
      amount: true,
      amountPaid: true,
      status: true,
    },
  });

  logger.info('Fine updated', { fineId });
  return updated;
};

export const waivedFine = async (fineId: string, branchId: string) => {
  const fine = await prisma.fine.findFirst({
    where: { id: fineId, branchId },
  });

  if (!fine) {
    throw new Error('FINE_NOT_FOUND');
  }

  await prisma.fine.update({
    where: { id: fineId },
    data: { status: 'WAIVED', settledAt: new Date() },
  });

  logger.info('Fine waived', { fineId });
};
