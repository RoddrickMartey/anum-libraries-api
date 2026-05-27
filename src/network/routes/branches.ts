// src/network/routes/branches.ts

import { Router } from 'express';
import * as branchesController from '../controllers/branches.controller.js';
import { networkAuth } from '../middleware/networkAuth.js';

const router = Router();

router.use(networkAuth);

router.get('/', branchesController.listBranches);
router.post('/', branchesController.createBranch);
router.get('/:id', branchesController.getBranch);
router.patch('/:id', branchesController.updateBranch);
router.post('/:id/deactivate', branchesController.deactivateBranch);

export default router;
