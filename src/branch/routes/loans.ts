import { Router } from 'express';
import * as loansController from '../controllers/loans.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';

const router = Router();

router.use(branchAuth);

router.get('/member/:memberId', loansController.listActiveLoansByMember);
router.post('/', loansController.checkOutCopy);
router.get('/:id', loansController.getLoan);
router.post('/:loanId/check-in', loansController.checkInCopy);
router.post('/:loanId/renew', loansController.renewLoan);

export default router;
