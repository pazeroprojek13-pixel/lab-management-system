import { prisma } from '../lib/prisma';
import { EquipmentStatus } from '@prisma/client';
import { auditLogService } from './audit-log.service';

export interface CreateEquipmentInput {
  code: string;
  name: string;
  category: string;
  brand?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  status?: EquipmentStatus;
  condition?: string;
  description?: string;
  labId: string;
  campusId: string;
}

export interface UpdateEquipmentInput {
  code?: string;
  name?: string;
  category?: string;
  brand?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  status?: EquipmentStatus;
  condition?: string;
  description?: string;
  labId?: string;
  campusId?: string;
}

export interface FindAllOptions {
  page?: number;
  limit?: number;
  campusId?: string;
  labId?: string;
  status?: EquipmentStatus;
  category?: string;
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

export class EquipmentService {
  async findAll(options?: FindAllOptions): Promise<PaginatedResult<any>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    // Filter out deleted equipment by default
    if (!options?.includeDeleted) {
      where.isDeleted = false;
    }

    // Filter by campus
    if (options?.campusId) {
      where.campusId = options.campusId;
    }

    // Filter by lab
    if (options?.labId) {
      where.labId = options.labId;
    }

    // Filter by status
    if (options?.status) {
      where.status = options.status;
    }

    // Filter by category
    if (options?.category) {
      where.category = options.category;
    }

    const [equipment, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          lab: {
            select: { id: true, name: true, code: true },
          },
          campus: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.equipment.count({ where }),
    ]);

    return {
      data: equipment,
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

    return prisma.equipment.findUnique({
      where,
      include: {
        lab: {
          select: { id: true, name: true, code: true },
        },
        campus: {
          select: { id: true, name: true, code: true },
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

    return prisma.equipment.findFirst({
      where,
      include: {
        lab: {
          select: { id: true, name: true, code: true },
        },
        campus: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async create(input: CreateEquipmentInput) {
    return prisma.equipment.create({
      data: {
        code: input.code,
        name: input.name,
        category: input.category,
        brand: input.brand,
        serialNumber: input.serialNumber,
        purchaseDate: input.purchaseDate,
        warrantyEndDate: input.warrantyEndDate,
        status: input.status || EquipmentStatus.ACTIVE,
        condition: input.condition,
        description: input.description,
        labId: input.labId,
        campusId: input.campusId,
        isDeleted: false,
      },
      include: {
        lab: {
          select: { id: true, name: true, code: true },
        },
        campus: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async update(id: string, input: UpdateEquipmentInput, performedById?: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.equipment.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          campusId: true,
        },
      });

      if (!existing) {
        throw new Error('Equipment not found');
      }

      const updated = await tx.equipment.update({
        where: { id },
        data: {
          code: input.code,
          name: input.name,
          category: input.category,
          brand: input.brand,
          serialNumber: input.serialNumber,
          purchaseDate: input.purchaseDate,
          warrantyEndDate: input.warrantyEndDate,
          status: input.status,
          condition: input.condition,
          description: input.description,
          labId: input.labId,
          campusId: input.campusId,
        },
        include: {
          lab: {
            select: { id: true, name: true, code: true },
          },
          campus: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      if (existing.status !== updated.status && performedById) {
        await auditLogService.create(
          {
            campusId: existing.campusId,
            entityType: 'EQUIPMENT',
            entityId: existing.id,
            action: 'STATUS_CHANGE',
            oldValue: { status: existing.status },
            newValue: { status: updated.status },
            performedBy: performedById,
          },
          tx
        );
      }

      return updated;
    });
  }

  async softDelete(id: string) {
    return prisma.equipment.update({
      where: { id },
      data: { isDeleted: true },
      include: {
        lab: {
          select: { id: true, name: true, code: true },
        },
        campus: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async restore(id: string) {
    return prisma.equipment.update({
      where: { id },
      data: { isDeleted: false },
      include: {
        lab: {
          select: { id: true, name: true, code: true },
        },
        campus: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  async hardDelete(id: string) {
    return prisma.equipment.delete({ where: { id } });
  }
}

export const equipmentService = new EquipmentService();
