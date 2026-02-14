import { IncidentStatus, ProblemScope, Severity } from '@prisma/client';
import { incidentService } from '../services/incident.service';
export class IncidentController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const severity = req.query.severity;
            const labId = req.query.labId;
            const equipmentId = req.query.equipmentId;
            const campusId = req.query.campusId;
            const includeDeleted = req.query.includeDeleted === 'true';
            const user = req.user;
            const role = user.role;
            // Apply campus scoping
            let filterCampusId = campusId;
            // ADMIN can only see incidents in their campus
            if (role === 'ADMIN') {
                filterCampusId = user.campus_id;
            }
            // SUPER_ADMIN and DEVELOPER can see all or filter by campus
            // Regular users can only see incidents in their campus
            else if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                filterCampusId = user.campus_id;
            }
            const result = await incidentService.findAll({
                page,
                limit,
                status,
                severity,
                labId,
                equipmentId,
                campusId: filterCampusId,
                includeDeleted,
            });
            const response = {
                success: true,
                data: result.data,
                pagination: result.pagination,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get incidents error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async findById(req, res) {
        try {
            const id = req.params.id;
            const includeDeleted = req.query.includeDeleted === 'true';
            const incident = await incidentService.findById(id, includeDeleted);
            if (!incident) {
                const response = {
                    success: false,
                    message: 'Incident not found',
                };
                res.status(404).json(response);
                return;
            }
            // Check campus access
            const user = req.user;
            const role = user.role;
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (incident.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: incident belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            const response = {
                success: true,
                data: incident,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get incident error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async create(req, res) {
        try {
            const { problemScope, category, severity, description, equipmentId, labId, campusId, } = req.body;
            // Validate required fields
            if (!category || !description || !severity) {
                const response = {
                    success: false,
                    message: 'Category, description, and severity are required',
                };
                res.status(400).json(response);
                return;
            }
            // Validate problemScope if provided
            if (problemScope && !Object.values(ProblemScope).includes(problemScope)) {
                const response = {
                    success: false,
                    message: `Invalid problemScope. Must be one of: ${Object.values(ProblemScope).join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }
            // Validate severity
            if (!Object.values(Severity).includes(severity)) {
                const response = {
                    success: false,
                    message: `Invalid severity. Must be one of: ${Object.values(Severity).join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Determine campus ID — non-super roles are scoped to their own campus
            let targetCampusId = campusId;
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (!user.campus_id) {
                    const response = {
                        success: false,
                        message: 'User has no campus assigned',
                    };
                    res.status(400).json(response);
                    return;
                }
                if (campusId && campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Cannot report incident for a different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
                targetCampusId = user.campus_id;
            }
            if (!targetCampusId) {
                const response = {
                    success: false,
                    message: 'Campus ID is required',
                };
                res.status(400).json(response);
                return;
            }
            const incident = await incidentService.create({
                problemScope: problemScope || ProblemScope.OTHER,
                category,
                severity,
                description,
                equipmentId,
                labId,
                campusId: targetCampusId,
                reportedById: user.user_id,
            });
            const response = {
                success: true,
                data: incident,
                message: 'Incident reported successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Create incident error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async update(req, res) {
        try {
            const id = req.params.id;
            const { problemScope, category, severity, description, rootCause, correctiveAction, preventiveAction, equipmentId, labId, } = req.body;
            const existingIncident = await incidentService.findById(id);
            if (!existingIncident) {
                const response = {
                    success: false,
                    message: 'Incident not found',
                };
                res.status(404).json(response);
                return;
            }
            // Check campus access
            const user = req.user;
            const role = user.role;
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingIncident.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: incident belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // Validate problemScope if provided
            if (problemScope && !Object.values(ProblemScope).includes(problemScope)) {
                const response = {
                    success: false,
                    message: `Invalid problemScope. Must be one of: ${Object.values(ProblemScope).join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }
            // Validate severity if provided
            if (severity && !Object.values(Severity).includes(severity)) {
                const response = {
                    success: false,
                    message: `Invalid severity. Must be one of: ${Object.values(Severity).join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }
            const incident = await incidentService.update(id, {
                problemScope,
                category,
                severity,
                description,
                rootCause,
                correctiveAction,
                preventiveAction,
                equipmentId,
                labId,
            });
            const response = {
                success: true,
                data: incident,
                message: 'Incident updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update incident error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const { status, assignedToId, rootCause, correctiveAction, preventiveAction, } = req.body;
            // Validate status
            if (!status || !Object.values(IncidentStatus).includes(status)) {
                const response = {
                    success: false,
                    message: `Invalid status. Must be one of: ${Object.values(IncidentStatus).join(', ')}`,
                };
                res.status(400).json(response);
                return;
            }
            const existingIncident = await incidentService.findById(id);
            if (!existingIncident) {
                const response = {
                    success: false,
                    message: 'Incident not found',
                };
                res.status(404).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Check campus access
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingIncident.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: incident belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // ISO Lifecycle Rules
            const currentStatus = existingIncident.status;
            // Rule 1: Only ADMIN/SUPER_ADMIN/DEVELOPER can assign (OPEN -> ASSIGNED)
            if (status === IncidentStatus.ASSIGNED) {
                if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                    const response = {
                        success: false,
                        message: 'Only ADMIN can assign incidents',
                    };
                    res.status(403).json(response);
                    return;
                }
                if (currentStatus !== IncidentStatus.OPEN) {
                    const response = {
                        success: false,
                        message: 'Can only assign OPEN incidents',
                    };
                    res.status(400).json(response);
                    return;
                }
                if (!assignedToId) {
                    const response = {
                        success: false,
                        message: 'assignedToId is required when assigning incident',
                    };
                    res.status(400).json(response);
                    return;
                }
            }
            // Rule 2: Only the assigned user can move to IN_PROGRESS (SUPER_ADMIN/DEVELOPER bypass)
            if (status === IncidentStatus.IN_PROGRESS) {
                if (currentStatus !== IncidentStatus.ASSIGNED) {
                    const response = {
                        success: false,
                        message: 'Can only move ASSIGNED incidents to IN_PROGRESS',
                    };
                    res.status(400).json(response);
                    return;
                }
                if (role !== 'SUPER_ADMIN' &&
                    role !== 'DEVELOPER' &&
                    existingIncident.assignedToId !== user.user_id) {
                    const response = {
                        success: false,
                        message: 'Only the assigned user can move an incident to IN_PROGRESS',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // Rule 3: RESOLVED requires ISO fields
            if (status === IncidentStatus.RESOLVED) {
                if (currentStatus !== IncidentStatus.IN_PROGRESS) {
                    const response = {
                        success: false,
                        message: 'Can only resolve IN_PROGRESS incidents',
                    };
                    res.status(400).json(response);
                    return;
                }
                // Validate ISO fields for resolution
                const missingFields = [];
                if (!rootCause && !existingIncident.rootCause)
                    missingFields.push('rootCause');
                if (!correctiveAction && !existingIncident.correctiveAction)
                    missingFields.push('correctiveAction');
                if (!preventiveAction && !existingIncident.preventiveAction)
                    missingFields.push('preventiveAction');
                if (missingFields.length > 0) {
                    const response = {
                        success: false,
                        message: `ISO compliance: Missing required fields for resolution: ${missingFields.join(', ')}`,
                    };
                    res.status(400).json(response);
                    return;
                }
            }
            // Rule 4: Only ADMIN/SUPER_ADMIN/DEVELOPER can mark VERIFIED
            if (status === IncidentStatus.VERIFIED) {
                if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                    const response = {
                        success: false,
                        message: 'Only ADMIN can verify incidents',
                    };
                    res.status(403).json(response);
                    return;
                }
                if (currentStatus !== IncidentStatus.RESOLVED) {
                    const response = {
                        success: false,
                        message: 'Can only verify RESOLVED incidents',
                    };
                    res.status(400).json(response);
                    return;
                }
            }
            // Rule 5: CLOSED only after VERIFIED
            if (status === IncidentStatus.CLOSED) {
                if (currentStatus !== IncidentStatus.VERIFIED) {
                    const response = {
                        success: false,
                        message: 'Incident must be VERIFIED before CLOSED',
                    };
                    res.status(400).json(response);
                    return;
                }
            }
            const incident = await incidentService.updateStatus(id, {
                status,
                assignedToId,
                rootCause,
                correctiveAction,
                preventiveAction,
            }, user.user_id);
            const response = {
                success: true,
                data: incident,
                message: 'Incident status updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update incident status error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async delete(req, res) {
        try {
            const id = req.params.id;
            const existingIncident = await incidentService.findById(id);
            if (!existingIncident) {
                const response = {
                    success: false,
                    message: 'Incident not found',
                };
                res.status(404).json(response);
                return;
            }
            // Check campus access
            const user = req.user;
            const role = user.role;
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingIncident.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: incident belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // Soft delete
            const incident = await incidentService.softDelete(id);
            const response = {
                success: true,
                data: incident,
                message: 'Incident deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Delete incident error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async restore(req, res) {
        try {
            const id = req.params.id;
            const existingIncident = await incidentService.findById(id, true);
            if (!existingIncident) {
                const response = {
                    success: false,
                    message: 'Incident not found',
                };
                res.status(404).json(response);
                return;
            }
            if (!existingIncident.isDeleted) {
                const response = {
                    success: false,
                    message: 'Incident is not deleted',
                };
                res.status(400).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Check campus access
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingIncident.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: incident belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            const incident = await incidentService.restore(id);
            const response = {
                success: true,
                data: incident,
                message: 'Incident restored successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Restore incident error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
}
export const incidentController = new IncidentController();
//# sourceMappingURL=incident.controller.js.map