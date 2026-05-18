import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateNetworkBanInput,
  RevokeNetworkBanInput,
} from '../validators/networkBans.validator.js';

export const getNetworkBansByMember = async (memberId: string) => {
  const bans = await prisma.ban.findMany({
    where: {
      memberId,
      type: 'NETWORK',
    },
    select: {
      id: true,
      type: true,
      reason: true,
      legalReference: true,
      expiresAt: true,
      issuedAt: true,
      issuedBy: true,
      revokedAt: true,
    },
    orderBy: { issuedAt: 'desc' },
  });

  return bans;
};

export const getActiveNetworkBan = async (memberId: string) => {
  const now = new Date();
  const ban = await prisma.ban.findFirst({
    where: {
      memberId,
      type: 'NETWORK',
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });

  return ban;
};

export const createNetworkBan = async (
  input: CreateNetworkBanInput,
  staffId: string,
) => {
  const member = await prisma.member.findUnique({
    where: { id: input.memberId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  const ban = await prisma.ban.create({
    data: {
      memberId: input.memberId,
      type: 'NETWORK',
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

  logger.info('Network ban created', {
    banId: ban.id,
    memberId: input.memberId,
  });
  return ban;
};

export const revokeNetworkBan = async (
  banId: string,
  input: RevokeNetworkBanInput,
  staffId: string,
) => {
  const ban = await prisma.ban.findFirst({
    where: { id: banId, type: 'NETWORK' },
  });

  if (!ban) {
    throw new Error('BAN_NOT_FOUND');
  }

  await prisma.ban.update({
    where: { id: banId },
    data: {
      revokedAt: new Date(),
      revokedBy: staffId,
      revokeReason: input.revokeReason,
    },
  });

  logger.info('Network ban revoked', { banId });
};
