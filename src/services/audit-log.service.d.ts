import { AuditAction, AuditEntityType, Prisma } from '@prisma/client';
export interface CreateAuditLogInput {
    campusId: string;
    entityType: AuditEntityType;
    entityId: string;
    action: AuditAction;
    oldValue?: Prisma.InputJsonValue | null;
    newValue?: Prisma.InputJsonValue | null;
    performedBy: string;
}
export declare class AuditLogService {
    create(input: CreateAuditLogInput, tx?: Prisma.TransactionClient): Promise<{
        id: string;
        action: import(".prisma/client").$Enums.AuditAction;
        createdAt: Date;
        campusId: string;
        entityId: string;
        entityType: import(".prisma/client").$Enums.AuditEntityType;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        performedBy: string;
    }>;
}
export declare const auditLogService: AuditLogService;
//# sourceMappingURL=audit-log.service.d.ts.map