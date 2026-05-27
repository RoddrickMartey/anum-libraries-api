import bcrypt from 'bcrypt';
import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import env from '../../config/env.js';
import type {
  CreateStaffInput,
  UpdateStaffInput,
  ChangePasswordInput,
} from '../validators/staff.validator.js';

// ─── GET ALL STAFF ────────────────────────────────────────────────────────────

export const getAllStaff = async (branchId: string) => {
  const staff = await prisma.staff.findMany({
    where: { branchId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return staff;
};

// ─── GET STAFF BY ID ──────────────────────────────────────────────────────────

export const getStaffById = async (staffId: string, branchId: string) => {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, branchId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!staff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  return staff;
};

// ─── CREATE STAFF ─────────────────────────────────────────────────────────────

export const createStaff = async (
  input: CreateStaffInput,
  branchId: string,
  createdBy: string,
) => {
  // Check if email already exists
  const existingStaff = await prisma.staff.findUnique({
    where: { email: input.email },
  });

  if (existingStaff) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const tempPassword = 'AnumStaff@2024';
  // Hash password
  const passwordHash = await bcrypt.hash(tempPassword, env.BCRYPT_ROUNDS);

  const staff = await prisma.staff.create({
    data: {
      branchId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role,
      createdBy,
      mustChangePassword: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,
    },
  });

  logger.info('Staff member created', {
    staffId: staff.id,
    role: staff.role,
    createdBy,
  });

  return staff;
};

// ─── UPDATE STAFF ─────────────────────────────────────────────────────────────

export const updateStaff = async (
  staffId: string,
  branchId: string,
  input: UpdateStaffInput,
) => {
  // Verify staff exists and belongs to branch
  const existingStaff = await prisma.staff.findFirst({
    where: { id: staffId, branchId },
  });

  if (!existingStaff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  // Check if new email already exists (if email is being updated)
  if (input.email && input.email !== existingStaff.email) {
    const emailInUse = await prisma.staff.findUnique({
      where: { email: input.email },
    });

    if (emailInUse) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }

  const staff = await prisma.staff.update({
    where: { id: staffId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role,
      isActive: input.isActive,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  logger.info('Staff member updated', { staffId });

  return staff;
};

// ─── DELETE STAFF ─────────────────────────────────────────────────────────────

export const deleteStaff = async (staffId: string, branchId: string) => {
  // Verify staff exists and belongs to branch
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, branchId },
  });

  if (!staff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  await prisma.staff.delete({
    where: { id: staffId },
  });

  logger.info('Staff member deleted', { staffId });
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────────────────────

export const changePassword = async (
  staffId: string,
  branchId: string,
  input: ChangePasswordInput,
) => {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, branchId },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!staff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  // Verify current password
  const passwordMatch = await bcrypt.compare(
    input.currentPassword,
    staff.passwordHash,
  );

  if (!passwordMatch) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(
    input.newPassword,
    env.BCRYPT_ROUNDS,
  );

  await prisma.staff.update({
    where: { id: staffId },
    data: { passwordHash: newPasswordHash, mustChangePassword: false },
  });

  logger.info('Staff member password changed', { staffId });
};

// ─── DEACTIVATE STAFF ─────────────────────────────────────────────────────────

export const deactivateStaff = async (staffId: string, branchId: string) => {
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, branchId },
  });

  if (!staff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: { isActive: false },
  });

  logger.info('Staff member deactivated', { staffId });
};
