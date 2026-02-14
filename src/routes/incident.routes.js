import * as express from 'express';
import { Role } from '@prisma/client';
import { incidentController } from '../controllers/incident.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = express.Router();
// All incident routes require authentication
router.use(authMiddleware);
// View incidents - all authenticated users
router.get('/', incidentController.findAll.bind(incidentController));
router.get('/:id', incidentController.findById.bind(incidentController));
// Report incident - all authenticated users
router.post('/', incidentController.create.bind(incidentController));
// Update incident - ADMIN, LAB_ASSISTANT, SUPER_ADMIN, DEVELOPER
router.put('/:id', requireRole(Role.ADMIN, Role.LAB_ASSISTANT, Role.SUPER_ADMIN, Role.DEVELOPER), incidentController.update.bind(incidentController));
// Update status with lifecycle rules - ADMIN, LAB_ASSISTANT, SUPER_ADMIN, DEVELOPER
router.patch('/:id/status', requireRole(Role.ADMIN, Role.LAB_ASSISTANT, Role.SUPER_ADMIN, Role.DEVELOPER), incidentController.updateStatus.bind(incidentController));
// Soft delete incident - ADMIN, SUPER_ADMIN, DEVELOPER
router.delete('/:id', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER), incidentController.delete.bind(incidentController));
// Restore deleted incident - ADMIN, SUPER_ADMIN, DEVELOPER
router.post('/:id/restore', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER), incidentController.restore.bind(incidentController));
export default router;
//# sourceMappingURL=incident.routes.js.map