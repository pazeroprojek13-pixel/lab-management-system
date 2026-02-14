import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => notificationController.findAll(req, res));
router.patch('/:id/read', (req, res) => notificationController.markRead(req, res));

export default router;
