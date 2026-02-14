import { Router } from 'express';
import { Role } from '@prisma/client';
import { inventoryController } from '../controllers/inventory.controller';
import { authMiddleware, requireRole } from '../middleware';
const router = Router();
// Equipment routes
router.get('/equipment', (req, res) => inventoryController.findAllEquipment(req, res));
router.get('/equipment/:id', (req, res) => inventoryController.findEquipmentById(req, res));
router.post('/equipment', authMiddleware, requireRole(Role.ADMIN, Role.LAB_ASSISTANT), (req, res) => inventoryController.createEquipment(req, res));
router.put('/equipment/:id', authMiddleware, requireRole(Role.ADMIN, Role.LAB_ASSISTANT), (req, res) => inventoryController.updateEquipment(req, res));
router.delete('/equipment/:id', authMiddleware, requireRole(Role.ADMIN), (req, res) => inventoryController.deleteEquipment(req, res));
// Lab routes
router.get('/labs', (req, res) => inventoryController.findAllLabs(req, res));
router.get('/labs/:id', (req, res) => inventoryController.findLabById(req, res));
export default router;
//# sourceMappingURL=inventory.routes.js.map