import { prisma } from '../lib/prisma';
import { LabStatus } from '@prisma/client';

export interface CreateLabInput {
  name: string;
  code: string;
  type?: string;
  capacity: number;
  location?: string;
  description?: string;
  campusId: string;
}

export interface UpdateLabInput {
  name?: string;
  code?: string;
  type?: string;
  capacity?: number;
  location?: string;
  description?: string;
  status?: LabStatus;
  campusId?: string;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  campusId?: string;
  status?: LabStatus;
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

export class LabService {
  async findAll(options?: FindAllOptions): Promise<PaginatedResult<any>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filter out deleted labs by default
    if (!options?.includeDeleted) {
      where.isDeleted = false;
    }

    // Filter by campus
    if (options?.campusId) {
      where.campusId = options.campusId;
    }

    // Filter by status
    if (options?.status) {
      where.status = options.status;
    }

    const [labs, total] = await Promise.all([
      prisma.lab.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campus: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              equipments: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.lab.count({ where }),
    ]);

    return {
      data: labs,
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

    return prisma.lab.findUnique({
      where,
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async findByCodeAndCampus(code: string, campusId: string, includeDeleted = false) {
    const where: any = { 
      code,
      campusId,
    };
    
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    return prisma.lab.findFirst({
      where,
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async create(input: CreateLabInput) {
    return prisma.lab.create({
      data: {
        name: input.name,
        code: input.code,
        type: input.type,
        capacity: input.capacity,
        location: input.location,
        description: input.description,
        campusId: input.campusId,
        isDeleted: false,
      },
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async update(id: string, input: UpdateLabInput) {
    return prisma.lab.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code,
        type: input.type,
        capacity: input.capacity,
        location: input.location,
        description: input.description,
        status: input.status,
        campusId: input.campusId,
      },
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async softDelete(id: string) {
    return prisma.lab.update({
      where: { id },
      data: { isDeleted: true },
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async restore(id: string) {
    return prisma.lab.update({
      where: { id },
      data: { isDeleted: false },
      include: {
        campus: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            equipments: true,
            bookings: true,
          },
        },
      },
    });
  }

  async hardDelete(id: string) {
    return prisma.lab.delete({ where: { id } });
  }
}

export const labService = new LabService();
