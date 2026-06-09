// src/branch/middleware/requireRole.ts

import { NextFunction, Request, Response } from 'express';
import type { Role } from '../../generated/prisma/client.js';
import { ROLE_HIERARCHY } from '../../config/constants.js';
import { AppError } from '../../shared/utils/appError.js';

export const requireRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.staff) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }

    const currentRole = req.staff.role as Role;

    const currentLevel = ROLE_HIERARCHY[currentRole];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (currentLevel < requiredLevel) {
      return next(
        new AppError(403, 'INSUFFICIENT_ROLE', 'Insufficient permissions'),
      );
    }

    next();
  };
};
