// src/shared/utils/jwt.ts

import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import { JwtPayload } from '../types/auth.type.js';

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
