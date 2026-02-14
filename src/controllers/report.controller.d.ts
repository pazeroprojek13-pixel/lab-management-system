import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class ReportController {
    getIncidentSummary(req: AuthRequest, res: Response): Promise<void>;
    getEquipmentHealth(req: AuthRequest, res: Response): Promise<void>;
    getMaintenanceCostSummary(req: AuthRequest, res: Response): Promise<void>;
    exportCapa(req: AuthRequest, res: Response): Promise<void>;
}
export declare const reportController: ReportController;
//# sourceMappingURL=report.controller.d.ts.map