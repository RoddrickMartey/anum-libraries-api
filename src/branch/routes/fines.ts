import { Router } from 'express';
import * as finesController from '../controllers/fines.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(branchAuth);

router.get('/member/:memberId', finesController.listFinesByMember);
router.post('/', requireRole('LIBRARIAN'), finesController.createFine);
router.get('/:id', finesController.getFine);
router.patch('/:id', requireRole('LIBRARIAN'), finesController.updateFine);
router.post('/:id/waive', requireRole('BRANCH_ADMIN'), finesController.waiveFine);

export default router;
