import prisma from '../../shared/prisma.js';
import type { AuditFilterInput } from '../validators/networkAudit.validator.js';

export const getAuditLogs = async (filters: AuditFilterInput) => {
  const skip = ((filters.page || 1) - 1) * (filters.limit || 20);
  const take = filters.limit || 20;

  const where: any = {};

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      actor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.auditLog.count({ where });

  return {
    data: logs,
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || 20,
      total,
      pages: Math.ceil(total / (filters.limit || 20)),
    },
  };
};

export const getAuditLogsByEntity = async (
  entityType: string,
  entityId: string,
) => {
  const logs = await prisma.auditLog.findMany({
    where: { entityType, entityId },
    include: {
      actor: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return logs;
};

export const getAuditLogsByActor = async (actorId: string) => {
  const logs = await prisma.auditLog.findMany({
    where: { actorId },
    include: {
      branch: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return logs;
};
