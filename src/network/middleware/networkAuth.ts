import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt.js';

export const networkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get token from Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    // Fall back to cookies if header token not found
    const tokenFromCookie = req.cookies?.accessToken;

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    const payload = verifyAccessToken(token);

    // Only SUPER_ADMIN allowed on network routes
    if (payload.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'SUPER_ADMIN access required',
        code: 'BRANCH_TOKEN_NETWORK_ACCESS',
      });
    }

    (req as any).staff = {
      staffId: payload.staffId,
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
