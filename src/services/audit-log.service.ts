import { AuditAction, AuditEntityType, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

export interface CreateAuditLogInput {
  campusId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  oldValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
  performedBy: string;
}

export class AuditLogService {
  async create(input: CreateAuditLogInput, tx?: Prisma.TransactionClient) {
    const client: PrismaExecutor = tx || prisma;
    return client.auditLog.create({
      data: {
        campusId: input.campusId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
        performedBy: input.performedBy,
      },
    });
  }
}

export const auditLogService = new AuditLogService();
