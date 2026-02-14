import { Response } from 'express';
import { MaintenanceStatus } from '@prisma/client';
import { maintenanceService } from '../services/maintenance.service';
import { AuthRequest } from '../middleware';
import { ExtendedRole } from '../lib/campusScope';
import { prisma } from '../lib/prisma';

// ─── Standard response format (matches all other modules) ────────────────────

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAdminLevel(role: ExtendedRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}

function isSuperLevel(role: ExtendedRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class MaintenanceController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page           = parseInt(req.query.page as string) || 1;
      const limit          = parseInt(req.query.limit as string) || 10;
      const status         = req.query.status as MaintenanceStatus | undefined;
      const equipmentId    = req.query.equipmentId as string | undefined;
      const incidentId     = req.query.incidentId as string | undefined;
      const includeDeleted = req.query.includeDeleted === 'true';

      const user = req.user!;
      const role = user.role as ExtendedRole;

      // Campus scoping — only SUPER_ADMIN/DEVELOPER see all
      let filterCampusId: string | undefined;
      if (!isSuperLevel(role)) {
        filterCampusId = user.campus_id;
      } else {
        filterCampusId = req.query.campusId as string | undefined;
      }

      const result = await maintenanceService.findAll({
        page,
        limit,
        status,
        campusId:    filterCampusId,
        equipmentId,
        incidentId,
        includeDeleted,
      });

      const response: ApiResponse = {
        success:    true,
        data:       result.data,
        pagination: result.pagination,
      };
      res.json(response);
    } catch (error) {
      console.error('Get maintenances error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id             = req.params.id;
      const includeDeleted = req.query.includeDeleted === 'true';

      const maintenance = await maintenanceService.findById(id, includeDeleted);
      if (!maintenance) {
        res.status(404).json({ success: false, message: 'Maintenance not found' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      if (!isSuperLevel(role) && maintenance.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' } as ApiResponse);
        return;
      }

      res.json({ success: true, data: maintenance } as ApiResponse);
    } catch (error) {
      console.error('Get maintenance error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, incidentId, equipmentId, vendorName, labId, scheduledDate } = req.body;

      if (!title) {
        res.status(400).json({ success: false, message: 'title is required' } as ApiResponse);
        return;
      }
      if (!incidentId) {
        res.status(400).json({ success: false, message: 'incidentId is required' } as ApiResponse);
        return;
      }
      if (!equipmentId) {
        res.status(400).json({ success: false, message: 'equipmentId is required' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      // Resolve campus from equipment — user must not supply campusId directly
      const equipment = await prisma.equipment.findFirst({
        where:  { id: equipmentId, isDeleted: false },
        select: { id: true, campusId: true },
      });

      if (!equipment) {
        res.status(404).json({ success: false, message: 'Equipment not found' } as ApiResponse);
        return;
      }

      if (!isSuperLevel(role) && equipment.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Equipment belongs to a different campus' } as ApiResponse);
        return;
      }

      // Verify incidentId exists and is on the same campus
      const incident = await prisma.incident.findFirst({
        where:  { id: incidentId, isDeleted: false },
        select: { id: true, campusId: true },
      });

      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found' } as ApiResponse);
        return;
      }

      if (!isSuperLevel(role) && incident.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Incident belongs to a different campus' } as ApiResponse);
        return;
      }

      const maintenance = await maintenanceService.create({
        title,
        description,
        incidentId,
        equipmentId,
        campusId:      equipment.campusId,
        createdById:   user.user_id,
        vendorName,
        labId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      });

      res.status(201).json({
        success: true,
        data:    maintenance,
        message: 'Maintenance record created successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Create maintenance error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { title, description, vendorName, cost, resolutionNotes, notes, scheduledDate } = req.body;

      const existing = await maintenanceService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Maintenance not found' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' } as ApiResponse);
        return;
      }

      const maintenance = await maintenanceService.update(id, {
        title,
        description,
        vendorName,
        cost:           cost !== undefined ? Number(cost) : undefined,
        resolutionNotes,
        notes,
        scheduledDate:  scheduledDate ? new Date(scheduledDate) : undefined,
      });

      res.json({ success: true, data: maintenance, message: 'Maintenance updated successfully' } as ApiResponse);
    } catch (error) {
      console.error('Update maintenance error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const { status, vendorName, equipmentOutcome, cost, resolutionNotes } = req.body;

      if (!status || !Object.values(MaintenanceStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(MaintenanceStatus).join(', ')}`,
        } as ApiResponse);
        return;
      }

      const existing = await maintenanceService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Maintenance not found' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' } as ApiResponse);
        return;
      }

      const current = existing.status;

      // ── Rule 1: PENDING → SENT (ADMIN/SUPER_ADMIN only) ──────────────────────
      if (status === MaintenanceStatus.SENT) {
        if (!isAdminLevel(role)) {
          res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can send equipment to vendor' } as ApiResponse);
          return;
        }
        if (current !== MaintenanceStatus.PENDING) {
          res.status(400).json({ success: false, message: 'Can only send PENDING maintenance to vendor' } as ApiResponse);
          return;
        }
        if (!vendorName && !existing.vendorName) {
          res.status(400).json({ success: false, message: 'vendorName is required when sending to vendor' } as ApiResponse);
          return;
        }
      }

      // ── Rule 2: SENT → RETURNED (ADMIN/SUPER_ADMIN only) ─────────────────────
      if (status === MaintenanceStatus.RETURNED) {
        if (!isAdminLevel(role)) {
          res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can mark equipment as returned' } as ApiResponse);
          return;
        }
        if (current !== MaintenanceStatus.SENT) {
          res.status(400).json({ success: false, message: 'Can only mark SENT maintenance as RETURNED' } as ApiResponse);
          return;
        }
        if (!equipmentOutcome || !['ACTIVE', 'DAMAGED'].includes(equipmentOutcome)) {
          res.status(400).json({
            success: false,
            message: "equipmentOutcome is required ('ACTIVE' or 'DAMAGED') when returning equipment",
          } as ApiResponse);
          return;
        }
      }

      // ── Rule 3: COMPLETED only after RETURNED ─────────────────────────────────
      if (status === MaintenanceStatus.COMPLETED) {
        if (!isAdminLevel(role)) {
          res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can complete maintenance' } as ApiResponse);
          return;
        }
        if (current !== MaintenanceStatus.RETURNED) {
          res.status(400).json({ success: false, message: 'Maintenance must be RETURNED before it can be COMPLETED' } as ApiResponse);
          return;
        }
      }

      const maintenance = await maintenanceService.updateStatus(
        id,
        {
          status,
          vendorName,
          equipmentOutcome,
          cost:           cost !== undefined ? Number(cost) : undefined,
          resolutionNotes,
        },
        user.user_id
      );

      res.json({
        success: true,
        data:    maintenance,
        message: 'Maintenance status updated successfully',
      } as ApiResponse);
    } catch (error) {
      console.error('Update maintenance status error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const existing = await maintenanceService.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Maintenance not found' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' } as ApiResponse);
        return;
      }

      const maintenance = await maintenanceService.softDelete(id);
      res.json({ success: true, data: maintenance, message: 'Maintenance deleted successfully' } as ApiResponse);
    } catch (error) {
      console.error('Delete maintenance error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async restore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const existing = await maintenanceService.findById(id, true);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Maintenance not found' } as ApiResponse);
        return;
      }

      if (!existing.isDeleted) {
        res.status(400).json({ success: false, message: 'Maintenance is not deleted' } as ApiResponse);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' } as ApiResponse);
        return;
      }

      const maintenance = await maintenanceService.restore(id);
      res.json({ success: true, data: maintenance, message: 'Maintenance restored successfully' } as ApiResponse);
    } catch (error) {
      console.error('Restore maintenance error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }
}

export const maintenanceController = new MaintenanceController();
