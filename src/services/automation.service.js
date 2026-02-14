import { Severity } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { externalNotificationService } from './external-notification.service';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
export class AutomationService {
    async runWarrantyCheck() {
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(in30Days.getDate() + 30);
        const equipments = await prisma.equipment.findMany({
            where: {
                isDeleted: false,
                warrantyEndDate: {
                    gte: now,
                    lte: in30Days,
                },
            },
            select: {
                id: true,
                code: true,
                name: true,
                campusId: true,
                warrantyEndDate: true,
            },
        });
        const candidates = equipments.map((equipment) => ({
            campusId: equipment.campusId,
            entityId: equipment.id,
            message: `Warranty for ${equipment.code} (${equipment.name}) expires on ${equipment.warrantyEndDate?.toISOString().slice(0, 10)}`,
        }));
        const created = await this.createNotificationsIfNotExists('WARRANTY_ALERT', candidates);
        return { processed: candidates.length, created };
    }
    async runIncidentEscalationCheck() {
        const threshold = new Date(Date.now() - 72 * HOUR_MS);
        const incidents = await prisma.incident.findMany({
            where: {
                isDeleted: false,
                severity: { in: [Severity.HIGH, Severity.CRITICAL] },
                status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] },
                createdAt: { lte: threshold },
            },
            select: {
                id: true,
                severity: true,
                category: true,
                campusId: true,
                createdAt: true,
            },
        });
        const candidates = incidents.map((incident) => {
            const ageHours = Math.floor((Date.now() - incident.createdAt.getTime()) / HOUR_MS);
            return {
                campusId: incident.campusId,
                entityId: incident.id,
                message: `Escalation: ${incident.severity} incident "${incident.category}" has been open for ${ageHours}h`,
            };
        });
        const created = await this.createNotificationsIfNotExists('INCIDENT_ESCALATION', candidates);
        return { processed: candidates.length, created };
    }
    async runMaintenanceOverdueCheck() {
        const threshold = new Date(Date.now() - 7 * DAY_MS);
        const maintenances = await prisma.maintenance.findMany({
            where: {
                isDeleted: false,
                status: 'SENT',
                sentToVendorAt: { lte: threshold },
            },
            select: {
                id: true,
                title: true,
                campusId: true,
                sentToVendorAt: true,
            },
        });
        const candidates = maintenances.map((maintenance) => {
            const days = Math.floor((Date.now() - (maintenance.sentToVendorAt?.getTime() || Date.now())) / DAY_MS);
            return {
                campusId: maintenance.campusId,
                entityId: maintenance.id,
                message: `Maintenance overdue: "${maintenance.title}" has stayed in SENT for ${days} days`,
            };
        });
        const created = await this.createNotificationsIfNotExists('MAINTENANCE_OVERDUE', candidates);
        return { processed: candidates.length, created };
    }
    async createNotificationsIfNotExists(type, candidates) {
        if (candidates.length === 0)
            return 0;
        const createdForDispatch = await prisma.$transaction(async (tx) => {
            const entityIds = candidates.map((item) => item.entityId);
            const campusIds = Array.from(new Set(candidates.map((item) => item.campusId)));
            const existingUnread = await tx.notification.findMany({
                where: {
                    type,
                    isRead: false,
                    entityId: { in: entityIds },
                    campusId: { in: campusIds },
                },
                select: {
                    campusId: true,
                    entityId: true,
                },
            });
            const existingKey = new Set(existingUnread.map((item) => `${item.campusId}:${item.entityId}`));
            const toInsert = candidates
                .filter((item) => !existingKey.has(`${item.campusId}:${item.entityId}`))
                .map((item) => ({
                campusId: item.campusId,
                type,
                entityId: item.entityId,
                message: item.message,
                isRead: false,
            }));
            if (toInsert.length > 0) {
                await tx.notification.createMany({
                    data: toInsert,
                });
            }
            return toInsert;
        });
        externalNotificationService.notifyAsync(createdForDispatch.map((item) => ({
            type,
            campusId: item.campusId,
            entityId: item.entityId,
            message: item.message,
        })));
        logger.info({ type, processed: candidates.length, created: createdForDispatch.length }, 'Automation task completed');
        return createdForDispatch.length;
    }
}
export const automationService = new AutomationService();
//# sourceMappingURL=automation.service.js.map