import { Router } from 'express';
import branchesRouter from './branches.js';
import networkBansRouter from './networkBans.js';
import networkAuditRouter from './networkAudit.js';

const router = Router();

// Network admin routes
router.use('/branches', branchesRouter);
router.use('/bans', networkBansRouter);
router.use('/audit', networkAuditRouter);

export default router;
