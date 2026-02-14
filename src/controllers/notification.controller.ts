import { NotificationType, Prisma } from '@prisma/client';
import { Response } from 'express';
import { AuthRequest } from '../middleware';
import { ExtendedRole } from '../lib/campusScope';
import { prisma } from '../lib/prisma';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function isSuperLevel(role: ExtendedRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'DEVELOPER';
}

function resolveScopedCampusId(req: AuthRequest): { campusId?: string; error?: string } {
  const user = req.user!;
  const role = user.role as ExtendedRole;
  const requestedCampusId = req.query.campusId as string | undefined;

  if (isSuperLevel(role)) {
    return { campusId: requestedCampusId };
  }

  if (!user.campus_id) {
    return { error: 'User has no campus assigned' };
  }

  return { campusId: user.campus_id };
}

export class NotificationController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const scoped = resolveScopedCampusId(req);
      if (scoped.error) {
        res.status(400).json({ success: false, message: scoped.error } as ApiResponse);
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const type = req.query.type as NotificationType | undefined;
      if (type && !Object.values(NotificationType).includes(type)) {
        res.status(400).json({
          success: false,
          message: `Invalid type. Must be one of: ${Object.values(NotificationType).join(', ')}`,
        } as ApiResponse);
        return;
      }
      const isReadQuery = req.query.isRead as string | undefined;
      const isRead =
        isReadQuery === undefined ? undefined : isReadQuery.toLowerCase() === 'true';

      const where: Prisma.NotificationWhereInput = {
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
      } as ApiResponse);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }

  async markRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = req.user!;
      const role = user.role as ExtendedRole;

      const notification = await prisma.notification.findUnique({
        where: { id },
        select: {
          id: true,
          campusId: true,
          isRead: true,
        },
      });

      if (!notification) {
        res.status(404).json({ success: false, message: 'Notification not found' } as ApiResponse);
        return;
      }

      if (!isSuperLevel(role) && notification.campusId !== user.campus_id) {
        res.status(403).json({ success: false, message: 'Access denied: different campus' } as ApiResponse);
        return;
      }

      const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
      } as ApiResponse);
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' } as ApiResponse);
    }
  }
}

export const notificationController = new NotificationController();
