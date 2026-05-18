import { Router } from 'express';
import * as booksController from '../controllers/books.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(branchAuth);

router.get('/', booksController.listBooks);
router.post('/', requireRole('LIBRARIAN'), booksController.createBook);
router.get('/:id', booksController.getBook);
router.patch('/:id', requireRole('LIBRARIAN'), booksController.updateBook);
router.delete('/:id', requireRole('LIBRARIAN'), booksController.deleteBook);

export default router;
