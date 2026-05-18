import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type { CreateBanInput, RevokeBanInput } from '../validators/bans.validator.js';

export const getBansByMember = async (memberId: string, branchId?: string) => {
  const where: any = { memberId };
  if (branchId) where.branchId = branchId;

  const bans = await prisma.ban.findMany({
    where,
    select: {
      id: true,
      type: true,
      reason: true,
      expiresAt: true,
      issuedAt: true,
      revokedAt: true,
    },
    orderBy: { issuedAt: 'desc' },
  });

  return bans;
};

export const getActiveBan = async (memberId: string, type: 'BRANCH' | 'NETWORK') => {
  const now = new Date();
  const ban = await prisma.ban.findFirst({
    where: {
      memberId,
      type,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  return ban;
};

export const createBan = async (
  input: CreateBanInput,
  branchId: string,
  staffId: string,
) => {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  const ban = await prisma.ban.create({
    data: {
      memberId: input.memberId,
      branchId: input.type === 'BRANCH' ? branchId : null,
      type: input.type,
      reason: input.reason,
      legalReference: input.legalReference,
      expiresAt: input.expiresAt,
      issuedBy: staffId,
    },
    select: {
      id: true,
      type: true,
      reason: true,
      expiresAt: true,
      issuedAt: true,
    },
  });

  if (input.type === 'BRANCH') {
    await prisma.member.update({
      where: { id: input.memberId },
      data: { status: 'BANNED' },
    });
  }

  logger.info('Ban created', { banId: ban.id, type: input.type });
  return ban;
};

export const revokeBan = async (banId: string, branchId: string, input: RevokeBanInput, staffId: string) => {
  const ban = await prisma.ban.findFirst({
    where: { id: banId },
  });

  if (!ban) {
    throw new Error('BAN_NOT_FOUND');
  }

  if (ban.branchId && ban.branchId !== branchId) {
    throw new Error('UNAUTHORIZED');
  }

  await prisma.ban.update({
    where: { id: banId },
    data: {
      revokedAt: new Date(),
      revokedBy: staffId,
      revokeReason: input.revokeReason,
    },
  });

  logger.info('Ban revoked', { banId });
};
