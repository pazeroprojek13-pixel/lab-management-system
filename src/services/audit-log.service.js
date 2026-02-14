import { prisma } from '../lib/prisma';
export class AuditLogService {
    async create(input, tx) {
        const client = tx || prisma;
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
//# sourceMappingURL=audit-log.service.js.map