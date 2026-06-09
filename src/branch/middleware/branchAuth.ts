import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';
import { AppError } from '../../shared/utils/appError.js';

export const branchAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    const payload = verifyAccessToken(token);

    if (payload.branchId === null) {
      return next(
        new AppError(
          403,
          'SUPER_ADMIN_BRANCH_ACCESS',
          'SUPER_ADMIN cannot access branch routes',
        ),
      );
    }

    req.staff = {
      id: payload.staffId,
      branchId: payload.branchId,
      role: payload.role,
    };

    next();
  } catch {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
};
