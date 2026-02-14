import { labService } from '../services/lab.service';
export class LabController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const campusId = req.query.campusId;
            const status = req.query.status;
            const includeDeleted = req.query.includeDeleted === 'true';
            const user = req.user;
            const role = user.role;
            // Apply campus scoping
            let filterCampusId = campusId;
            // ADMIN can only see labs in their campus
            if (role === 'ADMIN') {
                filterCampusId = user.campus_id;
            }
            // SUPER_ADMIN and DEVELOPER can see all or filter by campus
            // Users can only see labs in their campus
            else if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER' && role !== 'ADMIN') {
                filterCampusId = user.campus_id;
            }
            const result = await labService.findAll({
                page,
                limit,
                campusId: filterCampusId,
                status,
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
            console.error('Get labs error:', error);
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
            const lab = await labService.findById(id, includeDeleted);
            if (!lab) {
                const response = {
                    success: false,
                    message: 'Lab not found',
                };
                res.status(404).json(response);
                return;
            }
            // Check campus access
            const user = req.user;
            const role = user.role;
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (lab.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: lab belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            const response = {
                success: true,
                data: lab,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get lab error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async create(req, res) {
        try {
            const { name, code, type, capacity, location, description, campusId } = req.body;
            // Validate required fields
            if (!name || !code || !capacity) {
                const response = {
                    success: false,
                    message: 'Name, code, and capacity are required',
                };
                res.status(400).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Determine campus for the lab
            let labCampusId = campusId;
            // ADMIN can only create labs in their campus
            if (role === 'ADMIN') {
                labCampusId = user.campus_id;
            }
            if (!labCampusId) {
                const response = {
                    success: false,
                    message: 'Campus ID is required',
                };
                res.status(400).json(response);
                return;
            }
            // Check if lab with same code exists in this campus
            const existingLab = await labService.findByCodeAndCampus(code, labCampusId);
            if (existingLab) {
                const response = {
                    success: false,
                    message: 'Lab with this code already exists in this campus',
                };
                res.status(409).json(response);
                return;
            }
            const lab = await labService.create({
                name,
                code,
                type,
                capacity: parseInt(capacity),
                location,
                description,
                campusId: labCampusId,
            });
            const response = {
                success: true,
                data: lab,
                message: 'Lab created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Create lab error:', error);
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
            const { name, code, type, capacity, location, description, status, campusId } = req.body;
            // Check if lab exists
            const existingLab = await labService.findById(id);
            if (!existingLab) {
                const response = {
                    success: false,
                    message: 'Lab not found',
                };
                res.status(404).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Check campus access
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                // ADMIN can only update labs in their campus
                if (existingLab.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: lab belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
                // ADMIN cannot move lab to different campus
                if (campusId && campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Cannot move lab to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // Check if new code conflicts with another lab in the same campus
            if (code && code !== existingLab.code) {
                const labWithCode = await labService.findByCodeAndCampus(code, campusId || existingLab.campusId);
                if (labWithCode && labWithCode.id !== id) {
                    const response = {
                        success: false,
                        message: 'Lab with this code already exists in this campus',
                    };
                    res.status(409).json(response);
                    return;
                }
            }
            const updateData = {
                name,
                code,
                type,
                capacity: capacity ? parseInt(capacity) : undefined,
                location,
                description,
                status,
            };
            // Only SUPER_ADMIN and DEVELOPER can move labs between campuses
            if (role === 'SUPER_ADMIN' || role === 'DEVELOPER') {
                updateData.campusId = campusId;
            }
            const lab = await labService.update(id, updateData);
            const response = {
                success: true,
                data: lab,
                message: 'Lab updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update lab error:', error);
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
            // Check if lab exists
            const existingLab = await labService.findById(id);
            if (!existingLab) {
                const response = {
                    success: false,
                    message: 'Lab not found',
                };
                res.status(404).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Check campus access
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingLab.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: lab belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            // Soft delete
            const lab = await labService.softDelete(id);
            const response = {
                success: true,
                data: lab,
                message: 'Lab deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Delete lab error:', error);
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
            // Check if lab exists (including deleted)
            const existingLab = await labService.findById(id, true);
            if (!existingLab) {
                const response = {
                    success: false,
                    message: 'Lab not found',
                };
                res.status(404).json(response);
                return;
            }
            if (!existingLab.isDeleted) {
                const response = {
                    success: false,
                    message: 'Lab is not deleted',
                };
                res.status(400).json(response);
                return;
            }
            const user = req.user;
            const role = user.role;
            // Check campus access
            if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
                if (existingLab.campusId !== user.campus_id) {
                    const response = {
                        success: false,
                        message: 'Access denied: lab belongs to different campus',
                    };
                    res.status(403).json(response);
                    return;
                }
            }
            const lab = await labService.restore(id);
            const response = {
                success: true,
                data: lab,
                message: 'Lab restored successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Restore lab error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
}
export const labController = new LabController();
//# sourceMappingURL=lab.controller.js.map