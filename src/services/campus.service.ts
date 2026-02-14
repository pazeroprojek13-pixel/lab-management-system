import { prisma } from '../lib/prisma';

export interface CreateCampusInput {
  name: string;
  code: string;
  location?: string;
  description?: string;
}

export interface UpdateCampusInput {
  name?: string;
  code?: string;
  location?: string;
  description?: string;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CampusService {
  async findAll(options?: FindAllOptions): Promise<PaginatedResult<any>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
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

  async findById(id: string, includeDeleted = false) {
    const where: any = { id };
    
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

  async findByCode(code: string, includeDeleted = false) {
    const where: any = { code };
    
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

  async create(input: CreateCampusInput) {
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

  async update(id: string, input: UpdateCampusInput) {
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

  async softDelete(id: string) {
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

  async restore(id: string) {
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

  async hardDelete(id: string) {
    return prisma.campus.delete({ where: { id } });
  }
}

export const campusService = new CampusService();
