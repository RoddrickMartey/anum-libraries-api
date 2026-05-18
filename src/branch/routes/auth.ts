import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', branchAuth, authController.getMe);

export default router;
