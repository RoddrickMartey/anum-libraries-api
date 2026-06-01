import { rateLimit } from 'express-rate-limit';

// ─── WORKER API LIMITER ──────────────────────────────────────────────────────
// Generous enough for a small staff team dealing with heavy book dashboards,
// but protects the server from being overwhelmed.
export const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 300, // Allows 60 requests per minute on average
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down your actions.',
    code: 'TOO_MANY_REQUESTS',
  },
});

// ─── STAFF AUTH LIMITER ────────────────────────────────────────────────────
// Prevents automated password guessing on your login endpoint,
// while giving staff a few chances if they forget their password.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'AUTH_LOCKOUT',
  },
});
