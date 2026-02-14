import { prisma } from '../lib/prisma';
export class EventService {
    async findAll(options) {
        const where = {};
        // Apply campus filter
        if (options?.campusId) {
            where.campusId = options.campusId;
        }
        // Apply user filter (for user roles to see their own + campus)
        if (options?.userId) {
            where.OR = [
                { campusId: options.campusId },
                { createdById: options.userId }
            ];
        }
        return prisma.event.findMany({
            where,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async findById(id) {
        return prisma.event.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async create(input) {
        return prisma.event.create({
            data: {
                title: input.title,
                description: input.description,
                startDate: input.startDate,
                endDate: input.endDate,
                location: input.location,
                createdById: input.createdById,
                campusId: input.campusId,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async update(id, input) {
        return prisma.event.update({
            where: { id },
            data: {
                title: input.title,
                description: input.description,
                startDate: input.startDate,
                endDate: input.endDate,
                location: input.location,
                campusId: input.campusId,
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true },
                },
                campus: {
                    select: { id: true, name: true, code: true },
                },
            },
        });
    }
    async delete(id) {
        return prisma.event.delete({ where: { id } });
    }
}
export const eventService = new EventService();
//# sourceMappingURL=event.service.js.map