import { inventoryService } from '../services/inventory.service';
import { checkResourceAccess } from '../lib/campusScope';
export class InventoryController {
    // Equipment endpoints
    async findAllEquipment(req, res) {
        try {
            const { labId, status } = req.query;
            const user = req.user;
            const role = user.role;
            // Build filters based on campus scope
            let campusFilter;
            // DEVELOPER and SUPER_ADMIN: No restrictions
            if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
                // ADMIN: Filter by their campus
                if (role === 'ADMIN') {
                    campusFilter = user.campus_id;
                }
                // USER roles: Filter by their campus
                else {
                    campusFilter = user.campus_id;
                }
            }
            const equipments = await inventoryService.findAll({
                labId: labId,
                status: status,
                campusId: campusFilter,
            });
            res.json({ equipments });
        }
        catch (error) {
            console.error('Get equipments error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async findEquipmentById(req, res) {
        try {
            const id = req.params.id;
            const equipment = await inventoryService.findById(id);
            if (!equipment) {
                res.status(404).json({ error: 'Equipment not found' });
                return;
            }
            // Check campus access via lab's campus
            const access = checkResourceAccess(req.user, equipment.lab?.campusId || undefined);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            res.json({ equipment });
        }
        catch (error) {
            console.error('Get equipment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async createEquipment(req, res) {
        try {
            const { name, code, category, description, labId, status } = req.body;
            if (!name || !code || !category || !labId) {
                res.status(400).json({ error: 'Name, code, category, and labId are required' });
                return;
            }
            const user = req.user;
            const role = user.role;
            // Get lab to check campus
            const lab = await inventoryService.findLabById(labId);
            if (!lab) {
                res.status(404).json({ error: 'Lab not found' });
                return;
            }
            // Check if admin can create at this campus
            if (role === 'ADMIN' && lab.campusId && lab.campusId !== user.campus_id) {
                res.status(403).json({ error: 'Cannot add equipment to different campus' });
                return;
            }
            const existingEquipment = await inventoryService.findByCode(code);
            if (existingEquipment) {
                res.status(409).json({ error: 'Equipment with this code already exists' });
                return;
            }
            const equipment = await inventoryService.create({
                name,
                code,
                category,
                description,
                labId,
                status,
            });
            res.status(201).json({
                message: 'Equipment created successfully',
                equipment,
            });
        }
        catch (error) {
            console.error('Create equipment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async updateEquipment(req, res) {
        try {
            const id = req.params.id;
            const { name, category, description, status, labId } = req.body;
            const existingEquipment = await inventoryService.findById(id);
            if (!existingEquipment) {
                res.status(404).json({ error: 'Equipment not found' });
                return;
            }
            // Check campus access
            const access = checkResourceAccess(req.user, existingEquipment.lab?.campusId || undefined);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            // If moving to different lab, check campus of new lab
            if (labId) {
                const newLab = await inventoryService.findLabById(labId);
                if (!newLab) {
                    res.status(404).json({ error: 'Target lab not found' });
                    return;
                }
                const user = req.user;
                const role = user.role;
                if (role === 'ADMIN' && newLab.campusId && newLab.campusId !== user.campus_id) {
                    res.status(403).json({ error: 'Cannot move equipment to different campus' });
                    return;
                }
            }
            const equipment = await inventoryService.update(id, {
                name,
                category,
                description,
                status,
                labId,
            }, req.user.user_id);
            res.json({
                message: 'Equipment updated successfully',
                equipment,
            });
        }
        catch (error) {
            console.error('Update equipment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteEquipment(req, res) {
        try {
            const id = req.params.id;
            const existingEquipment = await inventoryService.findById(id);
            if (!existingEquipment) {
                res.status(404).json({ error: 'Equipment not found' });
                return;
            }
            // Check campus access
            const access = checkResourceAccess(req.user, existingEquipment.lab?.campusId || undefined);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            await inventoryService.delete(id);
            res.json({ message: 'Equipment deleted successfully' });
        }
        catch (error) {
            console.error('Delete equipment error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Lab endpoints
    async findAllLabs(req, res) {
        try {
            const user = req.user;
            const role = user.role;
            // Build filters based on campus scope
            let campusFilter;
            // DEVELOPER and SUPER_ADMIN: No restrictions
            if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
                // ADMIN and USERS: Filter by their campus
                campusFilter = user.campus_id;
            }
            const labs = await inventoryService.findAllLabs({
                campusId: campusFilter,
            });
            res.json({ labs });
        }
        catch (error) {
            console.error('Get labs error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async findLabById(req, res) {
        try {
            const id = req.params.id;
            const lab = await inventoryService.findLabById(id);
            if (!lab) {
                res.status(404).json({ error: 'Lab not found' });
                return;
            }
            // Check campus access
            const access = checkResourceAccess(req.user, lab.campusId || undefined);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            res.json({ lab });
        }
        catch (error) {
            console.error('Get lab error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
export const inventoryController = new InventoryController();
//# sourceMappingURL=inventory.controller.js.map