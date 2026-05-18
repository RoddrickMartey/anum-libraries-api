// src/config/constants.ts

import { Role } from '../generated/prisma/client.js';

export const ROLE_HIERARCHY: Record<Role, number> = {
  DESK_STAFF: 1,
  LIBRARIAN: 2,
  SENIOR_LIBRARIAN: 3,
  BRANCH_ADMIN: 4,
  SUPER_ADMIN: 5,
};

export const DEFAULT_LOAN_RULES = {
  maxActiveLoans: 5,
  loanPeriodDays: 21,
  renewalsAllowed: 2,
  renewalExtensionDays: 14,
  reservationExpiryDays: 3,
  overdueFinePerDay: 0.2,
  maxFinePerLoan: 10.0,
  fineSuspensionThreshold: 5.0,
  shortLoanPeriodDays: 7,
} as const;

export const TOKEN_COOKIE_NAME = 'anum_refresh_token';

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max attempts per window
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;
