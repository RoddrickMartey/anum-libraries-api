import { Router } from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// All staff routes require authentication
router.use(branchAuth);

// ─── LIST AND CREATE ──────────────────────────────────────────────────────────
router.get('/', staffController.listStaff);
router.post('/', requireRole('BRANCH_ADMIN'), staffController.createStaff);

// ─── INDIVIDUAL STAFF OPERATIONS ──────────────────────────────────────────────
router.get('/:id', staffController.getStaff);
router.patch('/:id', requireRole('BRANCH_ADMIN'), staffController.updateStaff);
router.delete('/:id', requireRole('BRANCH_ADMIN'), staffController.deleteStaff);

// ─── PASSWORD AND STATUS ──────────────────────────────────────────────────────
router.post('/:id/change-password', staffController.changePassword);
router.post(
  '/:id/deactivate',
  requireRole('BRANCH_ADMIN'),
  staffController.deactivateStaff,
);

export default router;
