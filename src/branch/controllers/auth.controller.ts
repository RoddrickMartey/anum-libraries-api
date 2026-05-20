import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { loginSchema } from '../validators/auth.validator.js';
import { TOKEN_COOKIE_NAME } from '../../config/constants.js';
import logger from '../../shared/logger.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  // Validate input
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const data = await authService.login(result.data);

    // Set refresh token as httpOnly cookie
    res.cookie(TOKEN_COOKIE_NAME, data.refreshToken, COOKIE_OPTIONS);
    res.cookie('accessToken', data.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes for access token
    });

    res.status(200).json({
      staff: data.staff,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'INVALID_CREDENTIALS':
          res.status(401).json({
            error: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          });
          return;
        case 'ACCOUNT_DISABLED':
          res.status(403).json({
            error: 'Your account has been disabled',
            code: 'ACCOUNT_DISABLED',
          });
          return;
      }
    }
    logger.error('Unexpected error during login', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

// ─── REFRESH ──────────────────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies[TOKEN_COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      error: 'Refresh token missing',
      code: 'REFRESH_TOKEN_MISSING',
    });
    return;
  }

  try {
    const data = authService.refresh(token);
    res.cookie('accessToken', data.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes for access token
    });
    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch {
    res.status(401).json({
      error: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(TOKEN_COOKIE_NAME, COOKIE_OPTIONS);
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
};

// ─── GET ME ───────────────────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const staffId = req.staff?.id;

    if (!staffId) {
      res.status(401).json({
        error: 'Unauthorised',
        code: 'UNAUTHORISED',
      });
      return;
    }

    const staff = await authService.getMe(staffId);
    res.status(200).json({ staff });
  } catch (error) {
    if (error instanceof Error && error.message === 'STAFF_NOT_FOUND') {
      res.status(404).json({
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND',
      });
      return;
    }
    logger.error('Unexpected error in getMe', { error });
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};
