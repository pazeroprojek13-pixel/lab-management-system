import { Router } from 'express';
import { cronController } from '../controllers/cron.controller';
import { validateCronSecret } from '../middleware/cron-auth.middleware';
const router = Router();
router.use(validateCronSecret);
router.get('/warranty', (req, res) => cronController.runWarranty(req, res));
router.get('/incident-escalation', (req, res) => cronController.runIncidentEscalation(req, res));
router.get('/maintenance-overdue', (req, res) => cronController.runMaintenanceOverdue(req, res));
export default router;
//# sourceMappingURL=cron.routes.js.map