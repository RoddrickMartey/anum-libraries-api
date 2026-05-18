// src/branch/middleware/branchAuth.ts

import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';

export const branchAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    const payload = verifyAccessToken(token);

    // SUPER_ADMIN forbidden on branch routes
    if (payload.branchId === null) {
      return res.status(403).json({
        error: 'SUPER_ADMIN cannot access branch routes',
        code: 'SUPER_ADMIN_BRANCH_ACCESS',
      });
    }

    req.staff = {
      id: payload.staffId,
      branchId: payload.branchId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
};
