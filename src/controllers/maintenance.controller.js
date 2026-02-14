import { MaintenanceStatus } from '@prisma/client';
import { maintenanceService } from '../services/maintenance.service';
import { prisma } from '../lib/prisma';
// ─── Helpers ──────────────────────────────────────────────────────────────────
function isAdminLevel(role) {
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}
function isSuperLevel(role) {
    return role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}
// ─── Controller ───────────────────────────────────────────────────────────────
export class MaintenanceController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const equipmentId = req.query.equipmentId;
            const incidentId = req.query.incidentId;
            const includeDeleted = req.query.includeDeleted === 'true';
            const user = req.user;
            const role = user.role;
            // Campus scoping — only SUPER_ADMIN/DEVELOPER see all
            let filterCampusId;
            if (!isSuperLevel(role)) {
                filterCampusId = user.campus_id;
            }
            else {
                filterCampusId = req.query.campusId;
            }
            const result = await maintenanceService.findAll({
                page,
                limit,
                status,
                campusId: filterCampusId,
                equipmentId,
                incidentId,
                includeDeleted,
            });
            const response = {
                success: true,
                data: result.data,
                pagination: result.pagination,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get maintenances error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async findById(req, res) {
        try {
            const id = req.params.id;
            const includeDeleted = req.query.includeDeleted === 'true';
            const maintenance = await maintenanceService.findById(id, includeDeleted);
            if (!maintenance) {
                res.status(404).json({ success: false, message: 'Maintenance not found' });
                return;
            }
            const user = req.user;
            const role = user.role;
            if (!isSuperLevel(role) && maintenance.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' });
                return;
            }
            res.json({ success: true, data: maintenance });
        }
        catch (error) {
            console.error('Get maintenance error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async create(req, res) {
        try {
            const { title, description, incidentId, equipmentId, vendorName, labId, scheduledDate } = req.body;
            if (!title) {
                res.status(400).json({ success: false, message: 'title is required' });
                return;
            }
            if (!incidentId) {
                res.status(400).json({ success: false, message: 'incidentId is required' });
                return;
            }
            if (!equipmentId) {
                res.status(400).json({ success: false, message: 'equipmentId is required' });
                return;
            }
            const user = req.user;
            const role = user.role;
            // Resolve campus from equipment — user must not supply campusId directly
            const equipment = await prisma.equipment.findFirst({
                where: { id: equipmentId, isDeleted: false },
                select: { id: true, campusId: true },
            });
            if (!equipment) {
                res.status(404).json({ success: false, message: 'Equipment not found' });
                return;
            }
            if (!isSuperLevel(role) && equipment.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Equipment belongs to a different campus' });
                return;
            }
            // Verify incidentId exists and is on the same campus
            const incident = await prisma.incident.findFirst({
                where: { id: incidentId, isDeleted: false },
                select: { id: true, campusId: true },
            });
            if (!incident) {
                res.status(404).json({ success: false, message: 'Incident not found' });
                return;
            }
            if (!isSuperLevel(role) && incident.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Incident belongs to a different campus' });
                return;
            }
            const maintenance = await maintenanceService.create({
                title,
                description,
                incidentId,
                equipmentId,
                campusId: equipment.campusId,
                createdById: user.user_id,
                vendorName,
                labId,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            });
            res.status(201).json({
                success: true,
                data: maintenance,
                message: 'Maintenance record created successfully',
            });
        }
        catch (error) {
            console.error('Create maintenance error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async update(req, res) {
        try {
            const id = req.params.id;
            const { title, description, vendorName, cost, resolutionNotes, notes, scheduledDate } = req.body;
            const existing = await maintenanceService.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Maintenance not found' });
                return;
            }
            const user = req.user;
            const role = user.role;
            if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' });
                return;
            }
            const maintenance = await maintenanceService.update(id, {
                title,
                description,
                vendorName,
                cost: cost !== undefined ? Number(cost) : undefined,
                resolutionNotes,
                notes,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            });
            res.json({ success: true, data: maintenance, message: 'Maintenance updated successfully' });
        }
        catch (error) {
            console.error('Update maintenance error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const { status, vendorName, equipmentOutcome, cost, resolutionNotes } = req.body;
            if (!status || !Object.values(MaintenanceStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${Object.values(MaintenanceStatus).join(', ')}`,
                });
                return;
            }
            const existing = await maintenanceService.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Maintenance not found' });
                return;
            }
            const user = req.user;
            const role = user.role;
            if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' });
                return;
            }
            const current = existing.status;
            // ── Rule 1: PENDING → SENT (ADMIN/SUPER_ADMIN only) ──────────────────────
            if (status === MaintenanceStatus.SENT) {
                if (!isAdminLevel(role)) {
                    res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can send equipment to vendor' });
                    return;
                }
                if (current !== MaintenanceStatus.PENDING) {
                    res.status(400).json({ success: false, message: 'Can only send PENDING maintenance to vendor' });
                    return;
                }
                if (!vendorName && !existing.vendorName) {
                    res.status(400).json({ success: false, message: 'vendorName is required when sending to vendor' });
                    return;
                }
            }
            // ── Rule 2: SENT → RETURNED (ADMIN/SUPER_ADMIN only) ─────────────────────
            if (status === MaintenanceStatus.RETURNED) {
                if (!isAdminLevel(role)) {
                    res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can mark equipment as returned' });
                    return;
                }
                if (current !== MaintenanceStatus.SENT) {
                    res.status(400).json({ success: false, message: 'Can only mark SENT maintenance as RETURNED' });
                    return;
                }
                if (!equipmentOutcome || !['ACTIVE', 'DAMAGED'].includes(equipmentOutcome)) {
                    res.status(400).json({
                        success: false,
                        message: "equipmentOutcome is required ('ACTIVE' or 'DAMAGED') when returning equipment",
                    });
                    return;
                }
            }
            // ── Rule 3: COMPLETED only after RETURNED ─────────────────────────────────
            if (status === MaintenanceStatus.COMPLETED) {
                if (!isAdminLevel(role)) {
                    res.status(403).json({ success: false, message: 'Only ADMIN or SUPER_ADMIN can complete maintenance' });
                    return;
                }
                if (current !== MaintenanceStatus.RETURNED) {
                    res.status(400).json({ success: false, message: 'Maintenance must be RETURNED before it can be COMPLETED' });
                    return;
                }
            }
            const maintenance = await maintenanceService.updateStatus(id, {
                status,
                vendorName,
                equipmentOutcome,
                cost: cost !== undefined ? Number(cost) : undefined,
                resolutionNotes,
            }, user.user_id);
            res.json({
                success: true,
                data: maintenance,
                message: 'Maintenance status updated successfully',
            });
        }
        catch (error) {
            console.error('Update maintenance status error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async delete(req, res) {
        try {
            const id = req.params.id;
            const existing = await maintenanceService.findById(id);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Maintenance not found' });
                return;
            }
            const user = req.user;
            const role = user.role;
            if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' });
                return;
            }
            const maintenance = await maintenanceService.softDelete(id);
            res.json({ success: true, data: maintenance, message: 'Maintenance deleted successfully' });
        }
        catch (error) {
            console.error('Delete maintenance error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async restore(req, res) {
        try {
            const id = req.params.id;
            const existing = await maintenanceService.findById(id, true);
            if (!existing) {
                res.status(404).json({ success: false, message: 'Maintenance not found' });
                return;
            }
            if (!existing.isDeleted) {
                res.status(400).json({ success: false, message: 'Maintenance is not deleted' });
                return;
            }
            const user = req.user;
            const role = user.role;
            if (!isSuperLevel(role) && existing.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: maintenance belongs to different campus' });
                return;
            }
            const maintenance = await maintenanceService.restore(id);
            res.json({ success: true, data: maintenance, message: 'Maintenance restored successfully' });
        }
        catch (error) {
            console.error('Restore maintenance error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
export const maintenanceController = new MaintenanceController();
//# sourceMappingURL=maintenance.controller.js.map