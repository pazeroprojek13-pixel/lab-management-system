import { Router } from 'express';
import { Role } from '@prisma/client';
import { reportController } from '../controllers/report.controller';
import { authMiddleware, requireRole } from '../middleware';

const router = Router();

// All report routes require authentication and management-level roles
router.use(authMiddleware);
router.use(requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER));

router.get('/incidents-summary', (req, res) => reportController.getIncidentSummary(req, res));
router.get('/equipment-health', (req, res) => reportController.getEquipmentHealth(req, res));
router.get('/maintenance-cost', (req, res) => reportController.getMaintenanceCostSummary(req, res));
router.get('/capa-export', (req, res) => reportController.exportCapa(req, res));

export default router;
