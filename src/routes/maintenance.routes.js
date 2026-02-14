import { Router } from 'express';
import { Role } from '@prisma/client';
import { maintenanceController } from '../controllers/maintenance.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = Router();
// All maintenance routes require authentication
router.use(authMiddleware);
// ── Read (all authenticated users, campus-scoped internally) ─────────────────
router.get('/', maintenanceController.findAll.bind(maintenanceController));
router.get('/:id', maintenanceController.findById.bind(maintenanceController));
// ── Create — ADMIN, LAB_ASSISTANT, SUPER_ADMIN, DEVELOPER ────────────────────
router.post('/', requireRole(Role.ADMIN, Role.LAB_ASSISTANT, Role.SUPER_ADMIN, Role.DEVELOPER), maintenanceController.create.bind(maintenanceController));
// ── General field update — ADMIN, LAB_ASSISTANT, SUPER_ADMIN, DEVELOPER ──────
router.put('/:id', requireRole(Role.ADMIN, Role.LAB_ASSISTANT, Role.SUPER_ADMIN, Role.DEVELOPER), maintenanceController.update.bind(maintenanceController));
// ── Vendor lifecycle status transition — ADMIN, SUPER_ADMIN, DEVELOPER ───────
router.patch('/:id/status', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER), maintenanceController.updateStatus.bind(maintenanceController));
// ── Soft delete — ADMIN, SUPER_ADMIN, DEVELOPER ───────────────────────────────
router.delete('/:id', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER), maintenanceController.delete.bind(maintenanceController));
// ── Restore soft-deleted — ADMIN, SUPER_ADMIN, DEVELOPER ─────────────────────
router.post('/:id/restore', requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER), maintenanceController.restore.bind(maintenanceController));
export default router;
//# sourceMappingURL=maintenance.routes.js.map