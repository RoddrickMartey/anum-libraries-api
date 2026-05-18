import { Router } from 'express';
import { branchAuth } from '../middleware/branchAuth.js';

const router = Router();

router.use(branchAuth);

// Audit endpoints for retrieving audit logs
// TODO: Implement audit log retrieval

export default router;
