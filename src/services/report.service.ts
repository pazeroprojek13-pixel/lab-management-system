import { Prisma, ProblemScope, Severity } from '@prisma/client';
import { prisma } from '../lib/prisma';

export type AgingCategory = '0-24h' | '24-72h' | '3-7d' | '>7d';

export interface IncidentSummaryResult {
  totalIncidents: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    verified: number;
    closed: number;
  };
  bySeverity: Array<{ severity: Severity; count: number }>;
  byProblemScope: Array<{ problemScope: ProblemScope; count: number }>;
  aging: {
    byCategory: Array<{ agingCategory: AgingCategory; count: number }>;
    details: Array<{ incidentId: string; openHours: number; agingCategory: AgingCategory }>;
  };
}

export interface EquipmentHealthResult {
  totalEquipment: number;
  byStatus: {
    active: number;
    damaged: number;
    maintenance: number;
    retired: number;
  };
  warrantyExpired: number;
  warrantyExpiringWithin30Days: number;
}

export interface MaintenanceCostSummaryResult {
  totalCostPerCampus: Array<{
    campusId: string;
    campusName: string | null;
    campusCode: string | null;
    totalCost: number;
    mttrHours: number;
  }>;
  totalCostPerEquipment: Array<{
    equipmentId: string;
    equipmentName: string | null;
    equipmentCode: string | null;
    totalCost: number;
  }>;
  mttrHours: number;
}

export interface CapaExportRow {
  incidentId: string;
  severity: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  resolvedAt: string;
  verifiedAt: string;
}

function getAgingCategory(openHours: number): AgingCategory {
  if (openHours < 24) return '0-24h';
  if (openHours < 72) return '24-72h';
  if (openHours < 168) return '3-7d';
  return '>7d';
}

export class ReportService {
  async getIncidentSummary(campusId?: string): Promise<IncidentSummaryResult> {
    const where: Prisma.IncidentWhereInput = {
      isDeleted: false,
      ...(campusId ? { campusId } : {}),
    };

    const [totalIncidents, statusGroups, severityGroups, scopeGroups, agingCandidates] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      prisma.incident.groupBy({
        by: ['severity'],
        where,
        _count: { _all: true },
      }),
      prisma.incident.groupBy({
        by: ['problemScope'],
        where,
        _count: { _all: true },
      }),
      prisma.incident.findMany({
        where: {
          ...where,
          status: {
            in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'],
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      }),
    ]);

    const statusMap = statusGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, {});

    const nowTs = Date.now();
    const agingDetails = agingCandidates.map((incident) => {
      const openHours = Number(((nowTs - incident.createdAt.getTime()) / (1000 * 60 * 60)).toFixed(2));
      return {
        incidentId: incident.id,
        openHours,
        agingCategory: getAgingCategory(openHours),
      };
    });

    const agingCountMap = agingDetails.reduce<Record<AgingCategory, number>>(
      (acc, item) => {
        acc[item.agingCategory] += 1;
        return acc;
      },
      {
        '0-24h': 0,
        '24-72h': 0,
        '3-7d': 0,
        '>7d': 0,
      }
    );

    return {
      totalIncidents,
      byStatus: {
        open: statusMap.OPEN || 0,
        in_progress: statusMap.IN_PROGRESS || 0,
        resolved: statusMap.RESOLVED || 0,
        verified: statusMap.VERIFIED || 0,
        closed: statusMap.CLOSED || 0,
      },
      bySeverity: severityGroups.map((group) => ({
        severity: group.severity,
        count: group._count._all,
      })),
      byProblemScope: scopeGroups.map((group) => ({
        problemScope: group.problemScope,
        count: group._count._all,
      })),
      aging: {
        byCategory: [
          { agingCategory: '0-24h', count: agingCountMap['0-24h'] },
          { agingCategory: '24-72h', count: agingCountMap['24-72h'] },
          { agingCategory: '3-7d', count: agingCountMap['3-7d'] },
          { agingCategory: '>7d', count: agingCountMap['>7d'] },
        ],
        details: agingDetails,
      },
    };
  }

  async getEquipmentHealth(campusId?: string): Promise<EquipmentHealthResult> {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const where: Prisma.EquipmentWhereInput = {
      isDeleted: false,
      ...(campusId ? { campusId } : {}),
    };

    const [totalEquipment, statusGroups, warrantyExpired, warrantyExpiringWithin30Days] =
      await Promise.all([
        prisma.equipment.count({ where }),
        prisma.equipment.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
        }),
        prisma.equipment.count({
          where: {
            ...where,
            warrantyEndDate: { lt: now },
          },
        }),
        prisma.equipment.count({
          where: {
            ...where,
            warrantyEndDate: {
              gte: now,
              lte: in30Days,
            },
          },
        }),
      ]);

    const statusMap = statusGroups.reduce<Record<string, number>>((acc, group) => {
      acc[group.status] = group._count._all;
      return acc;
    }, {});

    return {
      totalEquipment,
      byStatus: {
        active: statusMap.ACTIVE || 0,
        damaged: statusMap.DAMAGED || 0,
        maintenance: statusMap.MAINTENANCE || 0,
        retired: statusMap.RETIRED || 0,
      },
      warrantyExpired,
      warrantyExpiringWithin30Days,
    };
  }

  async getMaintenanceCostSummary(campusId?: string): Promise<MaintenanceCostSummaryResult> {
    const baseWhere: Prisma.MaintenanceWhereInput = {
      isDeleted: false,
      ...(campusId ? { campusId } : {}),
    };

    const [costPerCampus, costPerEquipment, mttrRows, mttrPerCampusRows] = await Promise.all([
      prisma.maintenance.groupBy({
        by: ['campusId'],
        where: baseWhere,
        _sum: { cost: true },
      }),
      prisma.maintenance.groupBy({
        by: ['equipmentId'],
        where: {
          ...baseWhere,
          equipmentId: { not: null },
        },
        _sum: { cost: true },
      }),
      prisma.$queryRaw<Array<{ mttr_hours: number | null }>>(Prisma.sql`
        SELECT
          COALESCE(AVG(EXTRACT(EPOCH FROM (m."returned_from_vendor_at" - m."sent_to_vendor_at"))) / 3600, 0) AS mttr_hours
        FROM "Maintenance" m
        WHERE m."is_deleted" = false
          ${campusId ? Prisma.sql`AND m."campus_id" = ${campusId}` : Prisma.empty}
          AND m."sent_to_vendor_at" IS NOT NULL
          AND m."returned_from_vendor_at" IS NOT NULL
      `),
      prisma.$queryRaw<Array<{ campus_id: string; mttr_hours: number | null }>>(Prisma.sql`
        SELECT
          m."campus_id",
          COALESCE(AVG(EXTRACT(EPOCH FROM (m."returned_from_vendor_at" - m."sent_to_vendor_at"))) / 3600, 0) AS mttr_hours
        FROM "Maintenance" m
        WHERE m."is_deleted" = false
          ${campusId ? Prisma.sql`AND m."campus_id" = ${campusId}` : Prisma.empty}
          AND m."sent_to_vendor_at" IS NOT NULL
          AND m."returned_from_vendor_at" IS NOT NULL
        GROUP BY m."campus_id"
      `),
    ]);

    const campusIds = costPerCampus.map((item) => item.campusId);
    const equipmentIds = costPerEquipment
      .map((item) => item.equipmentId)
      .filter((value): value is string => Boolean(value));

    const [campuses, equipments] = await Promise.all([
      prisma.campus.findMany({
        where: { id: { in: campusIds } },
        select: { id: true, name: true, code: true },
      }),
      prisma.equipment.findMany({
        where: { id: { in: equipmentIds } },
        select: { id: true, name: true, code: true },
      }),
    ]);

    const campusMap = new Map(campuses.map((item) => [item.id, item]));
    const equipmentMap = new Map(equipments.map((item) => [item.id, item]));
    const mttrPerCampusMap = new Map(
      mttrPerCampusRows.map((row) => [row.campus_id, Number(row.mttr_hours || 0)])
    );

    return {
      totalCostPerCampus: costPerCampus.map((item) => {
        const campus = campusMap.get(item.campusId);
        return {
          campusId: item.campusId,
          campusName: campus?.name || null,
          campusCode: campus?.code || null,
          totalCost: Number(item._sum.cost || 0),
          mttrHours: mttrPerCampusMap.get(item.campusId) || 0,
        };
      }),
      totalCostPerEquipment: costPerEquipment
        .filter((item): item is typeof item & { equipmentId: string } => Boolean(item.equipmentId))
        .map((item) => {
          const equipment = equipmentMap.get(item.equipmentId);
          return {
            equipmentId: item.equipmentId,
            equipmentName: equipment?.name || null,
            equipmentCode: equipment?.code || null,
            totalCost: Number(item._sum.cost || 0),
          };
        }),
      mttrHours: Number(mttrRows[0]?.mttr_hours || 0),
    };
  }

  async getCapaExportRows(campusId?: string): Promise<CapaExportRow[]> {
    const incidents = await prisma.incident.findMany({
      where: {
        isDeleted: false,
        ...(campusId ? { campusId } : {}),
      },
      select: {
        id: true,
        severity: true,
        rootCause: true,
        correctiveAction: true,
        preventiveAction: true,
        resolvedAt: true,
        verifiedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return incidents.map((incident) => ({
      incidentId: incident.id,
      severity: incident.severity,
      rootCause: incident.rootCause || '',
      correctiveAction: incident.correctiveAction || '',
      preventiveAction: incident.preventiveAction || '',
      resolvedAt: incident.resolvedAt ? incident.resolvedAt.toISOString() : '',
      verifiedAt: incident.verifiedAt ? incident.verifiedAt.toISOString() : '',
    }));
  }
}

export const reportService = new ReportService();
