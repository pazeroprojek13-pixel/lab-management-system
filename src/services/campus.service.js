import { prisma } from '../lib/prisma';
export class CampusService {
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Filter out deleted campuses by default
        if (!options?.includeDeleted) {
            where.isDeleted = false;
        }
        const [campuses, total] = await Promise.all([
            prisma.campus.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            users: true,
                            labs: true,
                        },
                    },
                },
            }),
            prisma.campus.count({ where }),
        ]);
        return {
            data: campuses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, includeDeleted = false) {
        const where = { id };
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        return prisma.campus.findUnique({
            where,
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async findByCode(code, includeDeleted = false) {
        const where = { code };
        if (!includeDeleted) {
            where.isDeleted = false;
        }
        return prisma.campus.findUnique({
            where,
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async create(input) {
        return prisma.campus.create({
            data: {
                name: input.name,
                code: input.code,
                location: input.location,
                description: input.description,
                isDeleted: false,
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async update(id, input) {
        return prisma.campus.update({
            where: { id },
            data: {
                name: input.name,
                code: input.code,
                location: input.location,
                description: input.description,
            },
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async softDelete(id) {
        return prisma.campus.update({
            where: { id },
            data: { isDeleted: true },
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async restore(id) {
        return prisma.campus.update({
            where: { id },
            data: { isDeleted: false },
            include: {
                _count: {
                    select: {
                        users: true,
                        labs: true,
                    },
                },
            },
        });
    }
    async hardDelete(id) {
        return prisma.campus.delete({ where: { id } });
    }
}
export const campusService = new CampusService();
//# sourceMappingURL=campus.service.js.map