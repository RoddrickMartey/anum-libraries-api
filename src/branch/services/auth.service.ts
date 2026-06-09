import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import env from '../../config/env.js';
import type { LoginInput } from '../validators/auth.validator.js';
import { JwtPayload, AuthTokens } from '../../shared/types/auth.type.js';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const generateTokens = (payload: JwtPayload): AuthTokens => {
  const accessToken = jwt.sign(
    payload,
    env.JWT_SECRET as string,
    {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign(
    payload,
    env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as string,
    } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
};

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export const login = async (input: LoginInput) => {
  const staff = await prisma.staff.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      branchId: true,
      firstName: true,
      lastName: true,
      email: true,
      passwordHash: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      branch: {
        select: {
          name: true,
          town: true,
        },
      },
    },
  });

  if (!staff) {
    logger.warn('Login attempt with unknown email', { email: input.email });
    throw new Error('INVALID_CREDENTIALS');
  }

  if (!staff.isActive) {
    logger.warn('Login attempt by inactive staff', { staffId: staff.id });
    throw new Error('ACCOUNT_DISABLED');
  }

  const passwordMatch = await bcrypt.compare(
    input.password,
    staff.passwordHash,
  );
  if (!passwordMatch) {
    logger.warn('Login attempt with wrong password', { staffId: staff.id });
    throw new Error('INVALID_CREDENTIALS');
  }

  const payload: JwtPayload = {
    staffId: staff.id,
    branchId: staff.branchId,
    role: staff.role,
  };

  const tokens: AuthTokens = generateTokens(payload);

  await prisma.staff.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info('Staff logged in', { staffId: staff.id, role: staff.role });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    mustChangePassword: staff.mustChangePassword,
    staff: {
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      role: staff.role,
      mustChangePassword: staff.mustChangePassword,
      branch: staff.branch,
    },
  };
};

export const refresh = (token: string) => {
  try {
    const payload = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET as string,
    ) as JwtPayload;

    const newPayload: JwtPayload = {
      staffId: payload.staffId,
      branchId: payload.branchId,
      role: payload.role,
    };

    const accessToken = jwt.sign(
      newPayload,
      env.JWT_SECRET as string,
      {
        expiresIn: env.JWT_EXPIRES_IN as string,
      } as jwt.SignOptions,
    );

    return { accessToken };
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
};

export const getMe = async (staffId: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
      branch: {
        select: { name: true, town: true },
      },
    },
  });

  if (!staff) {
    throw new Error('STAFF_NOT_FOUND');
  }

  return staff;
};
