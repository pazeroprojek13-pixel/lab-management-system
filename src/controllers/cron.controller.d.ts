import { Request, Response } from 'express';
export declare class CronController {
    runWarranty(req: Request, res: Response): Promise<void>;
    runIncidentEscalation(req: Request, res: Response): Promise<void>;
    runMaintenanceOverdue(req: Request, res: Response): Promise<void>;
}
export declare const cronController: CronController;
//# sourceMappingURL=cron.controller.d.ts.map