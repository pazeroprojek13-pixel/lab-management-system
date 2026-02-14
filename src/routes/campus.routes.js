import { Router } from 'express';
import { Role } from '@prisma/client';
import { campusController } from '../controllers/campus.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = Router();
// All routes require authentication
router.use(authMiddleware);
// List all campuses (paginated) - accessible by all authenticated users
router.get('/', (req, res) => campusController.findAll(req, res));
// Get single campus by ID - accessible by all authenticated users
router.get('/:id', (req, res) => campusController.findById(req, res));
// Create new campus - only SUPER_ADMIN and DEVELOPER
router.post('/', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER), (req, res) => campusController.create(req, res));
// Update campus - only SUPER_ADMIN and DEVELOPER
router.put('/:id', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER), (req, res) => campusController.update(req, res));
// Soft delete campus - only SUPER_ADMIN and DEVELOPER
router.delete('/:id', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER), (req, res) => campusController.delete(req, res));
// Restore soft-deleted campus - only SUPER_ADMIN and DEVELOPER
router.patch('/:id/restore', requireRole(Role.SUPER_ADMIN, Role.DEVELOPER), (req, res) => campusController.restore(req, res));
export default router;
//# sourceMappingURL=campus.routes.js.map