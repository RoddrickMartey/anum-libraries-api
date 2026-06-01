import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import authRouter from './branch/routes/auth.js';
import staffRouter from './branch/routes/staff.js';
import booksRouter from './branch/routes/books.js';
import copiesRouter from './branch/routes/copies.js';
import membersRouter from './branch/routes/members.js';
import loansRouter from './branch/routes/loans.js';
import reservationsRouter from './branch/routes/reservations.js';
import finesRouter from './branch/routes/fines.js';
import bansRouter from './branch/routes/bans.js';
import auditRouter from './branch/routes/audit.js';
import networkRouter from './network/routes/index.js';

import { health_html } from './data/health_html.js';
import { sanitizeInput } from './shared/utils/sanitizeInput.js';
import { globalLimiter, authLimiter } from './branch/middleware/rateLimiter.js';
import { globalErrorHandler } from './branch/middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1); // Trust first proxy for correct IP handling behind load balancers

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet());
app.use(sanitizeInput);
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  }),
);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.type('html').send(health_html);
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/staff', globalLimiter, staffRouter);
app.use('/api/v1/books', globalLimiter, booksRouter);
app.use('/api/v1/copies', globalLimiter, copiesRouter);
app.use('/api/v1/members', globalLimiter, membersRouter);
app.use('/api/v1/loans', globalLimiter, loansRouter);
app.use('/api/v1/reservations', globalLimiter, reservationsRouter);
app.use('/api/v1/fines', globalLimiter, finesRouter);
app.use('/api/v1/bans', globalLimiter, bansRouter);
app.use('/api/v1/audit', globalLimiter, auditRouter);

// Network admin routes (e.g., for monitoring, internal tools) are protected by the same global limiter, but could be further restricted with IP whitelisting or additional auth in the future.
app.use('/api/v1/network', globalLimiter, networkRouter);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

app.use(globalErrorHandler);

export default app;
