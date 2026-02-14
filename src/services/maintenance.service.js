import { MaintenanceStatus, EquipmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { auditLogService } from './audit-log.service';
// ─── Shared Prisma includes ──────────────────────────────────────────────────
const includeRelations = {
    incident: { select: { id: true, category: true, severity: true, status: true } },
    equipment: { select: { id: true, name: true, code: true, status: true } },
    campus: { select: { id: true, name: true, code: true } },
    createdBy: { select: { id: true, name: true, email: true, role: true } },
    lab: { select: { id: true, name: true, code: true } },
};
// ─── Service ─────────────────────────────────────────────────────────────────
export class MaintenanceService {
    async findAll(options) {
        const page = options?.page ?? 1;
        const limit = options?.limit ?? 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (!options?.includeDeleted)
            where.isDeleted = false;
        if (options?.status)
            where.status = options.status;
        if (options?.campusId)
            where.campusId = options.campusId;
        if (options?.equipmentId)
            where.equipmentId = options.equipmentId;
        if (options?.incidentId)
            where.incidentId = options.incidentId;
        if (options?.createdById)
            where.createdById = options.createdById;
        const [data, total] = await Promise.all([
            prisma.maintenance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: includeRelations,
            }),
            prisma.maintenance.count({ where }),
        ]);
        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(id, includeDeleted = false) {
        return prisma.maintenance.findFirst({
            where: {
                id,
                ...(includeDeleted ? {} : { isDeleted: false }),
            },
            include: includeRelations,
        });
    }
    async create(input) {
        return prisma.maintenance.create({
            data: {
                title: input.title,
                description: input.description,
                status: MaintenanceStatus.PENDING,
                incidentId: input.incidentId,
                equipmentId: input.equipmentId,
                campusId: input.campusId,
                createdById: input.createdById,
                vendorName: input.vendorName,
                labId: input.labId,
                scheduledDate: input.scheduledDate,
                isDeleted: false,
            },
            include: includeRelations,
        });
    }
    async update(id, input) {
        return prisma.maintenance.update({
            where: { id },
            data: input,
            include: includeRelations,
        });
    }
    /**
     * Vendor lifecycle transition.
     * Side effects:
     *   PENDING → SENT:     equipment.status = MAINTENANCE
     *   SENT   → RETURNED:  equipment.status = ACTIVE | DAMAGED
     */
    async updateStatus(id, input, performedById) {
        const updateData = {
            status: input.status,
        };
        if (input.status === MaintenanceStatus.SENT) {
            updateData.sentToVendorAt = new Date();
            if (input.vendorName)
                updateData.vendorName = input.vendorName;
        }
        if (input.status === MaintenanceStatus.RETURNED) {
            updateData.returnedFromVendorAt = new Date();
            if (input.cost !== undefined)
                updateData.cost = input.cost;
            if (input.resolutionNotes !== undefined)
                updateData.resolutionNotes = input.resolutionNotes;
        }
        if (input.status === MaintenanceStatus.COMPLETED) {
            updateData.completedDate = new Date();
        }
        // Run maintenance update + optional equipment side-effect + audit logs in a transaction
        const [maintenance] = await prisma.$transaction(async (tx) => {
            const existing = await tx.maintenance.findUnique({
                where: { id },
                select: {
                    id: true,
                    status: true,
                    vendorName: true,
                    cost: true,
                    resolutionNotes: true,
                    campusId: true,
                    createdById: true,
                    equipmentId: true,
                },
            });
            if (!existing) {
                throw new Error('Maintenance not found');
            }
            const updated = await tx.maintenance.update({
                where: { id },
                data: updateData,
                include: includeRelations,
            });
            // Equipment side-effects
            if (updated.equipmentId) {
                if (input.status === MaintenanceStatus.SENT) {
                    const existingEquipment = await tx.equipment.findUnique({
                        where: { id: updated.equipmentId },
                        select: { id: true, status: true, campusId: true },
                    });
                    await tx.equipment.update({
                        where: { id: updated.equipmentId },
                        data: { status: EquipmentStatus.MAINTENANCE },
                    });
                    if (existingEquipment && existingEquipment.status !== EquipmentStatus.MAINTENANCE) {
                        await auditLogService.create({
                            campusId: existingEquipment.campusId,
                            entityType: 'EQUIPMENT',
                            entityId: existingEquipment.id,
                            action: 'STATUS_CHANGE',
                            oldValue: { status: existingEquipment.status },
                            newValue: { status: EquipmentStatus.MAINTENANCE },
                            performedBy: performedById || existing.createdById,
                        }, tx);
                    }
                }
                if (input.status === MaintenanceStatus.RETURNED && input.equipmentOutcome) {
                    const existingEquipment = await tx.equipment.findUnique({
                        where: { id: updated.equipmentId },
                        select: { id: true, status: true, campusId: true },
                    });
                    const newStatus = input.equipmentOutcome === 'DAMAGED'
                        ? EquipmentStatus.DAMAGED
                        : EquipmentStatus.ACTIVE;
                    await tx.equipment.update({
                        where: { id: updated.equipmentId },
                        data: { status: newStatus },
                    });
                    if (existingEquipment && existingEquipment.status !== newStatus) {
                        await auditLogService.create({
                            campusId: existingEquipment.campusId,
                            entityType: 'EQUIPMENT',
                            entityId: existingEquipment.id,
                            action: 'STATUS_CHANGE',
                            oldValue: { status: existingEquipment.status },
                            newValue: { status: newStatus },
                            performedBy: performedById || existing.createdById,
                        }, tx);
                    }
                }
            }
            if (existing.status !== updated.status) {
                await auditLogService.create({
                    campusId: existing.campusId,
                    entityType: 'MAINTENANCE',
                    entityId: existing.id,
                    action: 'STATUS_CHANGE',
                    oldValue: {
                        status: existing.status,
                        vendorName: existing.vendorName,
                        cost: existing.cost ? Number(existing.cost) : null,
                        resolutionNotes: existing.resolutionNotes,
                    },
                    newValue: {
                        status: updated.status,
                        vendorName: updated.vendorName,
                        cost: updated.cost ? Number(updated.cost) : null,
                        resolutionNotes: updated.resolutionNotes,
                    },
                    performedBy: performedById || existing.createdById,
                }, tx);
            }
            return [updated];
        });
        return maintenance;
    }
    async softDelete(id) {
        return prisma.maintenance.update({
            where: { id },
            data: { isDeleted: true },
            include: includeRelations,
        });
    }
    async restore(id) {
        return prisma.maintenance.update({
            where: { id },
            data: { isDeleted: false },
            include: includeRelations,
        });
    }
}
export const maintenanceService = new MaintenanceService();
//# sourceMappingURL=maintenance.service.js.map