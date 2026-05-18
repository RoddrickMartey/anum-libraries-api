import { Router } from 'express';
import * as networkBansController from '../controllers/networkBans.controller.js';
import { networkAuth } from '../middleware/networkAuth.js';

const router = Router();

router.use(networkAuth);

router.get('/member/:memberId', networkBansController.listNetworkBansByMember);
router.post('/', networkBansController.createNetworkBan);
router.post('/:banId/revoke', networkBansController.revokeNetworkBan);

export default router;
