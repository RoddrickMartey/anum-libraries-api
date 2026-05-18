import { Router } from 'express';
import * as bansController from '../controllers/bans.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(branchAuth);

router.get('/member/:memberId', bansController.listBansByMember);
router.post('/', requireRole('BRANCH_ADMIN'), bansController.createBan);
router.post('/:banId/revoke', requireRole('BRANCH_ADMIN'), bansController.revokeBan);

export default router;
