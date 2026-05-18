import type { Role } from '../../generated/prisma/client.js';

declare global {
  namespace Express {
    interface Request {
      staff?: {
        id: string;
        branchId: string | null;
        role: Role;
      };
    }
  }
}

export {};
