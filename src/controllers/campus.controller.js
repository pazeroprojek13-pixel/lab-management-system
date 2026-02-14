import { campusService } from '../services/campus.service';
export class CampusController {
    async findAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const includeDeleted = req.query.includeDeleted === 'true';
            const result = await campusService.findAll({
                page,
                limit,
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
            console.error('Get campuses error:', error);
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
            const campus = await campusService.findById(id, includeDeleted);
            if (!campus) {
                const response = {
                    success: false,
                    message: 'Campus not found',
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: campus,
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get campus error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
    async create(req, res) {
        try {
            const { name, code, location, description } = req.body;
            // Validate required fields
            if (!name || !code) {
                const response = {
                    success: false,
                    message: 'Name and code are required',
                };
                res.status(400).json(response);
                return;
            }
            // Check if campus with same code already exists
            const existingCampus = await campusService.findByCode(code);
            if (existingCampus) {
                const response = {
                    success: false,
                    message: 'Campus with this code already exists',
                };
                res.status(409).json(response);
                return;
            }
            const campus = await campusService.create({
                name,
                code,
                location,
                description,
            });
            const response = {
                success: true,
                data: campus,
                message: 'Campus created successfully',
            };
            res.status(201).json(response);
        }
        catch (error) {
            console.error('Create campus error:', error);
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
            const { name, code, location, description } = req.body;
            // Check if campus exists
            const existingCampus = await campusService.findById(id);
            if (!existingCampus) {
                const response = {
                    success: false,
                    message: 'Campus not found',
                };
                res.status(404).json(response);
                return;
            }
            // Check if new code conflicts with another campus
            if (code && code !== existingCampus.code) {
                const campusWithCode = await campusService.findByCode(code);
                if (campusWithCode && campusWithCode.id !== id) {
                    const response = {
                        success: false,
                        message: 'Campus with this code already exists',
                    };
                    res.status(409).json(response);
                    return;
                }
            }
            const campus = await campusService.update(id, {
                name,
                code,
                location,
                description,
            });
            const response = {
                success: true,
                data: campus,
                message: 'Campus updated successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Update campus error:', error);
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
            // Check if campus exists
            const existingCampus = await campusService.findById(id);
            if (!existingCampus) {
                const response = {
                    success: false,
                    message: 'Campus not found',
                };
                res.status(404).json(response);
                return;
            }
            // Soft delete
            const campus = await campusService.softDelete(id);
            const response = {
                success: true,
                data: campus,
                message: 'Campus deleted successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Delete campus error:', error);
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
            // Check if campus exists (including deleted)
            const existingCampus = await campusService.findById(id, true);
            if (!existingCampus) {
                const response = {
                    success: false,
                    message: 'Campus not found',
                };
                res.status(404).json(response);
                return;
            }
            if (!existingCampus.isDeleted) {
                const response = {
                    success: false,
                    message: 'Campus is not deleted',
                };
                res.status(400).json(response);
                return;
            }
            const campus = await campusService.restore(id);
            const response = {
                success: true,
                data: campus,
                message: 'Campus restored successfully',
            };
            res.json(response);
        }
        catch (error) {
            console.error('Restore campus error:', error);
            const response = {
                success: false,
                message: 'Internal server error',
            };
            res.status(500).json(response);
        }
    }
}
export const campusController = new CampusController();
//# sourceMappingURL=campus.controller.js.map