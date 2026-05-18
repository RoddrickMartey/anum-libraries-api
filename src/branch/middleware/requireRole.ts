// src/branch/middleware/requireRole.ts

import { NextFunction, Request, Response } from 'express';
import type { Role } from '../../generated/prisma/client.js';
import { ROLE_HIERARCHY } from '../../config/constants.js';

export const requireRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.staff) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    const currentRole = req.staff.role as Role;

    const currentLevel = ROLE_HIERARCHY[currentRole];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (currentLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
};
