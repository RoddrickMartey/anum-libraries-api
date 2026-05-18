import { Router } from 'express';
import * as copiesController from '../controllers/copies.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(branchAuth);

router.get('/book/:bookId', copiesController.listCopiesByBook);
router.post('/', requireRole('LIBRARIAN'), copiesController.createCopy);
router.get('/:id', copiesController.getCopy);
router.patch('/:id', requireRole('LIBRARIAN'), copiesController.updateCopy);

export default router;
