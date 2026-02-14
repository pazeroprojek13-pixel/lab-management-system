import { prisma } from '../lib/prisma';

export interface CreateEventInput {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location: string;
  createdById: string;
  campusId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  campusId?: string;
}

export interface FindAllOptions {
  campusId?: string;
  userId?: string;
}

export class EventService {
  async findAll(options?: FindAllOptions) {
    const where: { campusId?: string; OR?: Array<{ campusId?: string } | { createdById?: string }> } = {};

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

  async findById(id: string) {
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

  async create(input: CreateEventInput) {
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

  async update(id: string, input: UpdateEventInput) {
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

  async delete(id: string) {
    return prisma.event.delete({ where: { id } });
  }
}

export const eventService = new EventService();
