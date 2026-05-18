// src/shared/types/auth.types.ts

import { Role } from '../../generated/prisma/client.js';

export interface JwtPayload {
  staffId: string;
  branchId: string | null;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
