import { automationService } from '../services/automation.service';
import { logger } from '../lib/logger';
export class CronController {
    async runWarranty(req, res) {
        try {
            const result = await automationService.runWarrantyCheck();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Cron warranty check failed');
            res.status(500).json({
                success: false,
                message: 'Cron warranty check failed',
            });
        }
    }
    async runIncidentEscalation(req, res) {
        try {
            const result = await automationService.runIncidentEscalationCheck();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Cron incident escalation failed');
            res.status(500).json({
                success: false,
                message: 'Cron incident escalation failed',
            });
        }
    }
    async runMaintenanceOverdue(req, res) {
        try {
            const result = await automationService.runMaintenanceOverdueCheck();
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Cron maintenance overdue failed');
            res.status(500).json({
                success: false,
                message: 'Cron maintenance overdue failed',
            });
        }
    }
}
export const cronController = new CronController();
//# sourceMappingURL=cron.controller.js.map