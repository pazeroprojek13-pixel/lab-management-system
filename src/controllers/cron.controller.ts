import { Request, Response } from 'express';
import { automationService } from '../services/automation.service';
import { logger } from '../lib/logger';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export class CronController {
  async runWarranty(req: Request, res: Response): Promise<void> {
    try {
      const result = await automationService.runWarrantyCheck();
      res.json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      logger.error({ err: error }, 'Cron warranty check failed');
      res.status(500).json({
        success: false,
        message: 'Cron warranty check failed',
      } as ApiResponse);
    }
  }

  async runIncidentEscalation(req: Request, res: Response): Promise<void> {
    try {
      const result = await automationService.runIncidentEscalationCheck();
      res.json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      logger.error({ err: error }, 'Cron incident escalation failed');
      res.status(500).json({
        success: false,
        message: 'Cron incident escalation failed',
      } as ApiResponse);
    }
  }

  async runMaintenanceOverdue(req: Request, res: Response): Promise<void> {
    try {
      const result = await automationService.runMaintenanceOverdueCheck();
      res.json({
        success: true,
        data: result,
      } as ApiResponse);
    } catch (error) {
      logger.error({ err: error }, 'Cron maintenance overdue failed');
      res.status(500).json({
        success: false,
        message: 'Cron maintenance overdue failed',
      } as ApiResponse);
    }
  }
}

export const cronController = new CronController();
