import { Router } from 'express';
import * as auditController from '../controllers/networkAudit.controller.js';
import { networkAuth } from '../middleware/networkAuth.js';

const router = Router();

router.use(networkAuth);

router.get('/', auditController.getAuditLogs);
router.get(
  '/entity/:entityType/:entityId',
  auditController.getAuditLogsByEntity,
);
router.get('/actor/:actorId', auditController.getAuditLogsByActor);

export default router;
