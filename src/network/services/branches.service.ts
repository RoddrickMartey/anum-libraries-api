import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from '../validators/branches.validator.js';

export const getAllBranches = async (skip: number = 0, take: number = 20) => {
  const branches = await prisma.branch.findMany({
    select: {
      id: true,
      name: true,
      town: true,
      address: true,
      phone: true,
      email: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { staff: true, members: true },
      },
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  return branches;
};

export const getBranchById = async (branchId: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      },
      _count: {
        select: { staff: true, members: true, books: true, loans: true },
      },
    },
  });

  if (!branch) {
    throw new Error('BRANCH_NOT_FOUND');
  }

  return branch;
};

export const createBranch = async (input: CreateBranchInput) => {
  const branch = await prisma.branch.create({
    data: {
      name: input.name,
      town: input.town,
      address: input.address,
      phone: input.phone,
      email: input.email,
      loanRules: input.loanRules || {},
    },
    select: {
      id: true,
      name: true,
      town: true,
      address: true,
      isActive: true,
      createdAt: true,
    },
  });

  logger.info('Branch created', { branchId: branch.id });
  return branch;
};

export const updateBranch = async (
  branchId: string,
  input: UpdateBranchInput,
) => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new Error('BRANCH_NOT_FOUND');
  }

  const updated = await prisma.branch.update({
    where: { id: branchId },
    data: {
      name: input.name,
      town: input.town,
      address: input.address,
      phone: input.phone,
      email: input.email,
      isActive: input.isActive,
      loanRules: input.loanRules,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      town: true,
      address: true,
      isActive: true,
      createdAt: true,
    },
  });

  logger.info('Branch updated', { branchId });
  return updated;
};

export const deactivateBranch = async (branchId: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    throw new Error('BRANCH_NOT_FOUND');
  }

  await prisma.branch.update({
    where: { id: branchId },
    data: { isActive: false },
  });

  logger.info('Branch deactivated', { branchId });
};
