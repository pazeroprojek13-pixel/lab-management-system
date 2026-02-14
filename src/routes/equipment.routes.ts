import * as express from 'express';
import { equipmentController } from '../controllers/equipment.controller';
import { authMiddleware, requireRole } from '../middleware';
import { Role } from '@prisma/client';

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Get all equipment - accessible by authenticated users
router.get('/', equipmentController.findAll.bind(equipmentController));

// Get equipment by ID - accessible by authenticated users
router.get('/:id', equipmentController.findById.bind(equipmentController));

// Create equipment - ADMIN, SUPER_ADMIN, DEVELOPER
router.post(
  '/',
  requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER),
  equipmentController.create.bind(equipmentController)
);

// Update equipment - ADMIN, SUPER_ADMIN, DEVELOPER
router.put(
  '/:id',
  requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER),
  equipmentController.update.bind(equipmentController)
);

// Soft delete equipment - ADMIN, SUPER_ADMIN, DEVELOPER
router.delete(
  '/:id',
  requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER),
  equipmentController.delete.bind(equipmentController)
);

// Restore deleted equipment - ADMIN, SUPER_ADMIN, DEVELOPER
router.post(
  '/:id/restore',
  requireRole(Role.ADMIN, Role.SUPER_ADMIN, Role.DEVELOPER),
  equipmentController.restore.bind(equipmentController)
);

export default router;
