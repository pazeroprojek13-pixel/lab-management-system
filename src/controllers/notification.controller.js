import { NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
function isSuperLevel(role) {
    return role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}
function resolveScopedCampusId(req) {
    const user = req.user;
    const role = user.role;
    const requestedCampusId = req.query.campusId;
    if (isSuperLevel(role)) {
        return { campusId: requestedCampusId };
    }
    if (!user.campus_id) {
        return { error: 'User has no campus assigned' };
    }
    return { campusId: user.campus_id };
}
export class NotificationController {
    async findAll(req, res) {
        try {
            const scoped = resolveScopedCampusId(req);
            if (scoped.error) {
                res.status(400).json({ success: false, message: scoped.error });
                return;
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const type = req.query.type;
            if (type && !Object.values(NotificationType).includes(type)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid type. Must be one of: ${Object.values(NotificationType).join(', ')}`,
                });
                return;
            }
            const isReadQuery = req.query.isRead;
            const isRead = isReadQuery === undefined ? undefined : isReadQuery.toLowerCase() === 'true';
            const where = {
                ...(scoped.campusId ? { campusId: scoped.campusId } : {}),
                ...(type ? { type } : {}),
                ...(isRead === undefined ? {} : { isRead }),
            };
            const [notifications, total] = await Promise.all([
                prisma.notification.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        campus: {
                            select: { id: true, name: true, code: true },
                        },
                    },
                }),
                prisma.notification.count({ where }),
            ]);
            res.json({
                success: true,
                data: notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async markRead(req, res) {
        try {
            const id = req.params.id;
            const user = req.user;
            const role = user.role;
            const notification = await prisma.notification.findUnique({
                where: { id },
                select: {
                    id: true,
                    campusId: true,
                    isRead: true,
                },
            });
            if (!notification) {
                res.status(404).json({ success: false, message: 'Notification not found' });
                return;
            }
            if (!isSuperLevel(role) && notification.campusId !== user.campus_id) {
                res.status(403).json({ success: false, message: 'Access denied: different campus' });
                return;
            }
            const updated = await prisma.$transaction(async (tx) => {
                if (notification.isRead) {
                    return tx.notification.findUnique({
                        where: { id: notification.id },
                        include: {
                            campus: { select: { id: true, name: true, code: true } },
                        },
                    });
                }
                return tx.notification.update({
                    where: { id: notification.id },
                    data: { isRead: true },
                    include: {
                        campus: { select: { id: true, name: true, code: true } },
                    },
                });
            });
            res.json({
                success: true,
                data: updated,
                message: 'Notification marked as read',
            });
        }
        catch (error) {
            console.error('Mark notification read error:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
export const notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map