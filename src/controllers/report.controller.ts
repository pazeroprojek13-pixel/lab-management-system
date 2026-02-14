import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { ExtendedRole } from '../lib/campusScope';
import { reportService } from '../services/report.service';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function resolveScopedCampusId(req: AuthRequest): { campusId?: string; error?: string } {
  const user = req.user!;
  const role = user.role as ExtendedRole;
  const requestedCampusId = req.query.campusId as string | undefined;

  const isSuperLevel = role === 'SUPER_ADMIN' || role === 'DEVELOPER';
  if (isSuperLevel) {
    return { campusId: requestedCampusId };
  }

  if (!user.campus_id) {
    return { error: 'User has no campus assigned' };
  }

  return { campusId: user.campus_id };
}

export class ReportController {
  async getIncidentSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoped = resolveScopedCampusId(req);
      if (scoped.error) {
        res.status(400).json({ success: false, message: scoped.error } as ApiResponse);
        return;
      }

      const data = await reportService.getIncidentSummary(scoped.campusId);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) {
      console.error('Get incident summary error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async getEquipmentHealth(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoped = resolveScopedCampusId(req);
      if (scoped.error) {
        res.status(400).json({ success: false, message: scoped.error } as ApiResponse);
        return;
      }

      const data = await reportService.getEquipmentHealth(scoped.campusId);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) {
      console.error('Get equipment health error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async getMaintenanceCostSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoped = resolveScopedCampusId(req);
      if (scoped.error) {
        res.status(400).json({ success: false, message: scoped.error } as ApiResponse);
        return;
      }

      const data = await reportService.getMaintenanceCostSummary(scoped.campusId);
      res.json({ success: true, data } as ApiResponse);
    } catch (error) {
      console.error('Get maintenance cost summary error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async exportCapa(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoped = resolveScopedCampusId(req);
      if (scoped.error) {
        res.status(400).json({ success: false, message: scoped.error } as ApiResponse);
        return;
      }

      const rows = await reportService.getCapaExportRows(scoped.campusId);
      const header = [
        'incidentId',
        'severity',
        'rootCause',
        'correctiveAction',
        'preventiveAction',
        'resolvedAt',
        'verifiedAt',
      ];

      const csvLines = [
        header.join(','),
        ...rows.map((row) =>
          [
            row.incidentId,
            row.severity,
            row.rootCause,
            row.correctiveAction,
            row.preventiveAction,
            row.resolvedAt,
            row.verifiedAt,
          ]
            .map((value) => escapeCsv(value))
            .join(',')
        ),
      ];

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="capa-export.csv"');
      res.status(200).send(csvLines.join('\n'));
    } catch (error) {
      console.error('Export CAPA error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }
}

export const reportController = new ReportController();
