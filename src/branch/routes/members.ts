import { Router } from 'express';
import * as membersController from '../controllers/members.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(branchAuth);

router.get('/', membersController.listMembers);
router.post('/', requireRole('LIBRARIAN'), membersController.createMember);
router.get('/:id', membersController.getMember);
router.patch('/:id', requireRole('LIBRARIAN'), membersController.updateMember);
router.post('/:id/suspend', requireRole('LIBRARIAN'), membersController.suspendMember);

export default router;
