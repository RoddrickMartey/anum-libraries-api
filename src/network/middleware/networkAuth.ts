import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/utils/appError.js';

export const networkAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    const payload = verifyAccessToken(token);

    if (payload.role !== 'SUPER_ADMIN') {
      return next(
        new AppError(
          403,
          'BRANCH_TOKEN_NETWORK_ACCESS',
          'SUPER_ADMIN access required',
        ),
      );
    }

    req.staff = {
      id: payload.staffId,
      role: payload.role,
      branchId: payload.branchId,
    };

    next();
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
};
