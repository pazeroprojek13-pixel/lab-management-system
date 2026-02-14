import { EquipmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { auditLogService } from './audit-log.service';
export class InventoryService {
    async findAll(params) {
        const where = {};
        if (params?.labId)
            where.labId = params.labId;
        if (params?.status)
            where.status = params.status;
        // Apply campus filter via lab relation
        if (params?.campusId) {
            where.lab = {
                campusId: params.campusId
            };
        }
        return prisma.equipment.findMany({
            where,
            include: {
                lab: {
                    select: { id: true, name: true, code: true, campusId: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findById(id) {
        return prisma.equipment.findUnique({
            where: { id },
            include: {
                lab: {
                    select: { id: true, name: true, code: true, location: true, campusId: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async findByCode(code) {
        return prisma.equipment.findUnique({
            where: { code },
            include: {
                lab: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async create(input) {
        return prisma.equipment.create({
            data: {
                name: input.name,
                code: input.code,
                category: input.category,
                description: input.description,
                status: input.status || EquipmentStatus.ACTIVE,
                labId: input.labId,
            },
            include: {
                lab: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async update(id, input, performedById) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.equipment.findUnique({
                where: { id },
                select: { id: true, status: true, campusId: true },
            });
            if (!existing) {
                throw new Error('Equipment not found');
            }
            const updated = await tx.equipment.update({
                where: { id },
                data: input,
                include: {
                    lab: {
                        select: { id: true, name: true, code: true },
                    },
                },
            });
            if (existing.status !== updated.status && performedById) {
                await auditLogService.create({
                    campusId: existing.campusId,
                    entityType: 'EQUIPMENT',
                    entityId: existing.id,
                    action: 'STATUS_CHANGE',
                    oldValue: { status: existing.status },
                    newValue: { status: updated.status },
                    performedBy: performedById,
                }, tx);
            }
            return updated;
        });
    }
    async delete(id) {
        return prisma.equipment.delete({ where: { id } });
    }
    async updateStatus(id, status, performedById) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.equipment.findUnique({
                where: { id },
                select: { id: true, status: true, campusId: true },
            });
            if (!existing) {
                throw new Error('Equipment not found');
            }
            const updated = await tx.equipment.update({
                where: { id },
                data: { status },
            });
            if (existing.status !== updated.status && performedById) {
                await auditLogService.create({
                    campusId: existing.campusId,
                    entityType: 'EQUIPMENT',
                    entityId: existing.id,
                    action: 'STATUS_CHANGE',
                    oldValue: { status: existing.status },
                    newValue: { status: updated.status },
                    performedBy: performedById,
                }, tx);
            }
            return updated;
        });
    }
    // Lab management
    async findAllLabs(options) {
        const where = {};
        // Apply campus filter
        if (options?.campusId) {
            where.campusId = options.campusId;
        }
        return prisma.lab.findMany({
            where,
            include: {
                _count: {
                    select: { equipments: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findLabById(id) {
        return prisma.lab.findUnique({
            where: { id },
            include: {
                equipments: true,
                campus: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { equipments: true },
                },
            },
        });
    }
}
export const inventoryService = new InventoryService();
//# sourceMappingURL=inventory.service.js.map