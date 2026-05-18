import { Router } from 'express';
import * as reservationsController from '../controllers/reservations.controller.js';
import { branchAuth } from '../middleware/branchAuth.js';

const router = Router();

router.use(branchAuth);

router.get('/book/:bookId', reservationsController.listReservationsByBook);
router.get('/member/:memberId', reservationsController.listReservationsByMember);
router.post('/', reservationsController.createReservation);
router.post('/:reservationId/cancel', reservationsController.cancelReservation);
router.post('/:reservationId/notify', reservationsController.notifyReservation);

export default router;
