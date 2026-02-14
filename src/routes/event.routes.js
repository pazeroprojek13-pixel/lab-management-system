import { Router } from 'express';
import { Role } from '@prisma/client';
import { eventController } from '../controllers/event.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = Router();
// Public routes - anyone can view events
router.get('/', (req, res) => eventController.findAll(req, res));
router.get('/:id', (req, res) => eventController.findById(req, res));
// Protected routes - only ADMIN and LAB_ASSISTANT can manage events
router.post('/', authMiddleware, requireRole(Role.ADMIN, Role.LAB_ASSISTANT), (req, res) => eventController.create(req, res));
router.put('/:id', authMiddleware, requireRole(Role.ADMIN, Role.LAB_ASSISTANT), (req, res) => eventController.update(req, res));
router.delete('/:id', authMiddleware, requireRole(Role.ADMIN), (req, res) => eventController.delete(req, res));
export default router;
//# sourceMappingURL=event.routes.js.map