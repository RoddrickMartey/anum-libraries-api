import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import bcrypt from 'bcrypt';
import env from '../../config/env.js';
import { DEFAULT_LOAN_RULES } from '../../config/constants.js';
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
  // Check admin email not already in use
  const existingStaff = await prisma.staff.findUnique({
    where: { email: input.adminEmail },
  });

  if (existingStaff) {
    throw new Error('ADMIN_EMAIL_TAKEN');
  }

  const tempPassword = 'AnumStaff@2024';
  const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_ROUNDS);

  // Create branch + admin account in one transaction
  const result = await prisma.$transaction(async (tx) => {
    const branch = await tx.branch.create({
      data: {
        name: input.name,
        town: input.town,
        address: input.address,
        phone: input.phone,
        email: input.email,
        loanRules: input.loanRules || DEFAULT_LOAN_RULES,
      },
    });

    const admin = await tx.staff.create({
      data: {
        branchId: branch.id,
        firstName: input.adminFirstName,
        lastName: input.adminLastName,
        email: input.adminEmail,
        passwordHash,
        role: 'BRANCH_ADMIN',
        isActive: true,
        mustChangePassword: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        mustChangePassword: true,
      },
    });

    return { branch, admin };
  });

  logger.info('Branch created with admin account', {
    branchId: result.branch.id,
    adminId: result.admin.id,
  });

  // Return temp password so SUPER_ADMIN can share it with the new admin
  // In production this would be emailed instead
  return {
    branch: {
      id: result.branch.id,
      name: result.branch.name,
      town: result.branch.town,
      address: result.branch.address,
      isActive: result.branch.isActive,
      createdAt: result.branch.createdAt,
    },
    admin: result.admin,
    tempPassword, // Remove this once email notifications are set up
  };
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
    },
    select: {
      id: true,
      name: true,
      town: true,
      address: true,
      isActive: true,
      updatedAt: true,
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
