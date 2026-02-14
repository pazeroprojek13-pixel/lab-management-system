import { Router } from 'express';
import { Role } from '@prisma/client';
import { labController } from '../controllers/lab.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = Router();
// All routes require authentication
router.use(authMiddleware);
// List all labs (paginated, filterable by campus) - accessible by all authenticated users
router.get('/', (req, res) => labController.findAll(req, res));
// Get single lab by ID - accessible by all authenticated users
router.get('/:id', (req, res) => labController.findById(req, res));
// Create new lab - only SUPER_ADMIN and DEVELOPER
router.post('/', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER, Role.ADMIN), (req, res) => labController.create(req, res));
// Update lab - SUPER_ADMIN, DEVELOPER can update any; ADMIN only within their campus
router.put('/:id', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER, Role.ADMIN), (req, res) => labController.update(req, res));
// Soft delete lab - only SUPER_ADMIN and DEVELOPER
router.delete('/:id', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER, Role.ADMIN), (req, res) => labController.delete(req, res));
// Restore soft-deleted lab - only SUPER_ADMIN and DEVELOPER
router.patch('/:id/restore', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER), (req, res) => labController.restore(req, res));
export default router;
//# sourceMappingURL=lab.routes.js.map