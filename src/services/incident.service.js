import { IncidentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { auditLogService } from './audit-log.service';
const userSelect = {
    select: { id: true, name: true, email: true, role: true },
};
const labSelect = {
    select: { id: true, name: true, code: true },
};
const equipmentSelect = {
    select: { id: true, name: true, code: true },
};
const campusSelect = {
    select: { id: true, name: true, code: true },
};
export class IncidentService {
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Filter out deleted by default
        if (!options?.includeDeleted) {
            where.isDeleted = false;
        }
        if (options?.status)
            where.status = options.status;
        if (options?.severity)
            where.severity = options.severity;
        if (options?.labId)
            where.labId = options.labId;
        if (options?.equipmentId)
            where.equipmentId = options.equipmentId;
        if (options?.campusId)
            where.campusId = options.campusId;
        if (options?.reportedById)
            where.reportedById = options.reportedById;
        if (options?.assignedToId)
            where.assignedToId = options.assignedToId;
        const [data, total] = await Promise.all([
            prisma.incident.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    reportedBy: userSelect,
                    assignedTo: userSelect,
                    lab: labSelect,
                    equipment: equipmentSelect,
                    campus: campusSelect,
                },
            }),
            prisma.incident.count({ where }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, includeDeleted = false) {
        return prisma.incident.findFirst({
            where: {
                id,
                ...(includeDeleted ? {} : { isDeleted: false }),
            },
            include: {
                reportedBy: userSelect,
                assignedTo: userSelect,
                lab: labSelect,
                equipment: equipmentSelect,
                campus: campusSelect,
            },
        });
    }
    async create(input) {
        return prisma.incident.create({
            data: {
                problemScope: input.problemScope,
                category: input.category,
                severity: input.severity,
                description: input.description,
                status: IncidentStatus.OPEN,
                equipmentId: input.equipmentId,
                labId: input.labId,
                campusId: input.campusId,
                reportedById: input.reportedById,
                isDeleted: false,
            },
            include: {
                reportedBy: userSelect,
                assignedTo: userSelect,
                lab: labSelect,
                equipment: equipmentSelect,
                campus: campusSelect,
            },
        });
    }
    async update(id, input) {
        return prisma.incident.update({
            where: { id },
            data: input,
            include: {
                reportedBy: userSelect,
                assignedTo: userSelect,
                lab: labSelect,
                equipment: equipmentSelect,
                campus: campusSelect,
            },
        });
    }
    async updateStatus(id, input, performedById) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.incident.findUnique({
                where: { id },
                select: {
                    id: true,
                    campusId: true,
                    status: true,
                    assignedToId: true,
                    rootCause: true,
                    correctiveAction: true,
                    preventiveAction: true,
                    reportedById: true,
                },
            });
            if (!existing) {
                throw new Error('Incident not found');
            }
            const data = {
                status: input.status,
            };
            // Handle assignment
            if (input.assignedToId !== undefined) {
                data.assignedTo = input.assignedToId
                    ? { connect: { id: input.assignedToId } }
                    : { disconnect: true };
            }
            // Handle ISO fields
            if (input.rootCause !== undefined)
                data.rootCause = input.rootCause;
            if (input.correctiveAction !== undefined)
                data.correctiveAction = input.correctiveAction;
            if (input.preventiveAction !== undefined)
                data.preventiveAction = input.preventiveAction;
            // Handle timestamp fields based on status
            if (input.status === IncidentStatus.RESOLVED) {
                data.resolvedAt = new Date();
            }
            if (input.status === IncidentStatus.VERIFIED) {
                data.verifiedAt = new Date();
            }
            const updated = await tx.incident.update({
                where: { id },
                data,
                include: {
                    reportedBy: userSelect,
                    assignedTo: userSelect,
                    lab: labSelect,
                    equipment: equipmentSelect,
                    campus: campusSelect,
                },
            });
            if (existing.status !== updated.status) {
                await auditLogService.create({
                    campusId: existing.campusId,
                    entityType: 'INCIDENT',
                    entityId: existing.id,
                    action: 'STATUS_CHANGE',
                    oldValue: {
                        status: existing.status,
                        assignedToId: existing.assignedToId,
                        rootCause: existing.rootCause,
                        correctiveAction: existing.correctiveAction,
                        preventiveAction: existing.preventiveAction,
                    },
                    newValue: {
                        status: updated.status,
                        assignedToId: updated.assignedToId,
                        rootCause: updated.rootCause,
                        correctiveAction: updated.correctiveAction,
                        preventiveAction: updated.preventiveAction,
                    },
                    performedBy: performedById || existing.reportedById,
                }, tx);
            }
            return updated;
        });
    }
    async softDelete(id) {
        return prisma.incident.update({
            where: { id },
            data: { isDeleted: true },
            include: {
                reportedBy: userSelect,
                assignedTo: userSelect,
                lab: labSelect,
                equipment: equipmentSelect,
                campus: campusSelect,
            },
        });
    }
    async restore(id) {
        return prisma.incident.update({
            where: { id },
            data: { isDeleted: false },
            include: {
                reportedBy: userSelect,
                assignedTo: userSelect,
                lab: labSelect,
                equipment: equipmentSelect,
                campus: campusSelect,
            },
        });
    }
    async hardDelete(id) {
        return prisma.incident.delete({ where: { id } });
    }
}
export const incidentService = new IncidentService();
//# sourceMappingURL=incident.service.js.map