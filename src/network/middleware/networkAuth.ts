import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';

export const networkAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    const payload = verifyAccessToken(token);

    if (payload.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'SUPER_ADMIN access required',
        code: 'BRANCH_TOKEN_NETWORK_ACCESS',
      });
    }

    req.staff = {
      id: payload.staffId,
      role: payload.role,
      branchId: payload.branchId,
    };

    next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
};
