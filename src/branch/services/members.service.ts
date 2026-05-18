import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from '../validators/members.validator.js';

export const getAllMembers = async (
  branchId: string,
  skip: number = 0,
  take: number = 20,
) => {
  const members = await prisma.member.findMany({
    where: { branchId },
    select: {
      id: true,
      cardNumber: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      status: true,
      cardExpiresAt: true,
      createdAt: true,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  return members;
};

export const getMemberById = async (memberId: string, branchId: string) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, branchId },
    include: {
      loans: {
        select: {
          id: true,
          status: true,
          dueAt: true,
          returnedAt: true,
        },
      },
      reservations: {
        select: {
          id: true,
          status: true,
          reservedAt: true,
        },
      },
      bans: {
        select: {
          id: true,
          type: true,
          expiresAt: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  return member;
};

export const createMember = async (
  input: CreateMemberInput,
  branchId: string,
  createdBy: string,
) => {
  const existingCard = await prisma.member.findUnique({
    where: { cardNumber: input.cardNumber },
  });

  if (existingCard) {
    throw new Error('CARD_NUMBER_ALREADY_EXISTS');
  }

  const member = await prisma.member.create({
    data: {
      branchId,
      cardNumber: input.cardNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      phone: input.phone,
      email: input.email,
      address: input.address,
      cardExpiresAt: input.cardExpiresAt,
      notes: input.notes,
      createdBy,
    },
    select: {
      id: true,
      cardNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
    },
  });

  logger.info('Member created', { memberId: member.id, branchId });
  return member;
};

export const updateMember = async (
  memberId: string,
  branchId: string,
  input: UpdateMemberInput,
) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  const updated = await prisma.member.update({
    where: { id: memberId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      cardExpiresAt: input.cardExpiresAt,
      status: input.status,
      notes: input.notes,
    },
    select: {
      id: true,
      cardNumber: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
    },
  });

  logger.info('Member updated', { memberId });
  return updated;
};

export const suspendMember = async (memberId: string, branchId: string) => {
  const member = await prisma.member.findFirst({
    where: { id: memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { status: 'SUSPENDED' },
  });

  logger.info('Member suspended', { memberId });
};
