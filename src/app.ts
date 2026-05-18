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

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  }),
);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', project: 'Anum Libraries API' });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/copies', copiesRouter);
app.use('/api/v1/members', membersRouter);
app.use('/api/v1/loans', loansRouter);
app.use('/api/v1/reservations', reservationsRouter);
app.use('/api/v1/fines', finesRouter);
app.use('/api/v1/bans', bansRouter);
app.use('/api/v1/audit', auditRouter);

// Network admin routes
app.use('/api/v1/network', networkRouter);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
  });
});

export default app;
