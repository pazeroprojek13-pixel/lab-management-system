import { Router } from 'express';
import { Role } from '@prisma/client';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, requireRole, requireOwnershipOrElevated } from '../middleware';
const router = Router();
// Public routes
router.post('/login', (req, res) => authController.login(req, res));
// Protected routes
router.post('/register', authMiddleware, requireRole(Role.SUPER_ADMIN, Role.DEVELOPER, Role.ADMIN), (req, res) => authController.register(req, res));
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));
// User management routes with campus/ownership checks
router.put('/users/:id', authMiddleware, requireOwnershipOrElevated((req) => req.params.id), (req, res) => authController.updateUser(req, res));
router.delete('/users/:id', authMiddleware, requireOwnershipOrElevated((req) => req.params.id), (req, res) => authController.deleteUser(req, res));
export default router;
//# sourceMappingURL=auth.routes.js.map