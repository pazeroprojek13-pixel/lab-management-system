import { Request, Response } from 'express';
import { EquipmentStatus } from '@prisma/client';
import { equipmentService } from '../services/equipment.service';
import { labService } from '../services/lab.service';
import { AuthRequest } from '../middleware';
import { ExtendedRole } from '../lib/campusScope';

// Standard response format
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

export class EquipmentController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const campusId = req.query.campusId as string | undefined;
      const labId = req.query.labId as string | undefined;
      const status = req.query.status as EquipmentStatus | undefined;
      const category = req.query.category as string | undefined;
      const includeDeleted = req.query.includeDeleted === 'true';
      
      const user = req.user!;
      const role = user.role as ExtendedRole;

      // Apply campus scoping
      let filterCampusId = campusId;
      
      // ADMIN can only see equipment in their campus
      if (role === 'ADMIN') {
        filterCampusId = user.campus_id;
      }
      // SUPER_ADMIN and DEVELOPER can see all or filter by campus
      // Users can only see equipment in their campus
      else if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER' && role !== 'ADMIN') {
        filterCampusId = user.campus_id;
      }

      const result = await equipmentService.findAll({
        page,
        limit,
        campusId: filterCampusId,
        labId,
        status,
        category,
        includeDeleted,
      });

      const response: ApiResponse = {
        success: true,
        data: result.data,
        pagination: result.pagination,
      };

      res.json(response);
    } catch (error) {
      console.error('Get equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const includeDeleted = req.query.includeDeleted === 'true';

      const equipment = await equipmentService.findById(id, includeDeleted);

      if (!equipment) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment not found',
        };
        res.status(404).json(response);
        return;
      }

      // Check campus access
      const user = req.user!;
      const role = user.role as ExtendedRole;
      
      if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
        if (equipment.campusId !== user.campus_id) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied: equipment belongs to different campus',
          };
          res.status(403).json(response);
          return;
        }
      }

      const response: ApiResponse = {
        success: true,
        data: equipment,
      };

      res.json(response);
    } catch (error) {
      console.error('Get equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        code,
        name,
        category,
        brand,
        serialNumber,
        purchaseDate,
        warrantyEndDate,
        status,
        condition,
        description,
        labId,
      } = req.body;

      // Validate required fields
      if (!code || !name || !category || !labId) {
        const response: ApiResponse = {
          success: false,
          message: 'Code, name, category, and labId are required',
        };
        res.status(400).json(response);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;
      
      // Get lab to determine campus
      const lab = await labService.findById(labId);
      if (!lab) {
        const response: ApiResponse = {
          success: false,
          message: 'Lab not found',
        };
        res.status(404).json(response);
        return;
      }

      // Check campus access
      if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
        if (lab.campusId !== user.campus_id) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied: lab belongs to different campus',
          };
          res.status(403).json(response);
          return;
        }
      }

      // Check if equipment with same code exists in this campus
      const existingEquipment = await equipmentService.findByCodeAndCampus(code, lab.campusId);
      if (existingEquipment) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment with this code already exists in this campus',
        };
        res.status(409).json(response);
        return;
      }

      const equipment = await equipmentService.create({
        code,
        name,
        category,
        brand,
        serialNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : undefined,
        status,
        condition,
        description,
        labId,
        campusId: lab.campusId,
      });

      const response: ApiResponse = {
        success: true,
        data: equipment,
        message: 'Equipment created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const {
        code,
        name,
        category,
        brand,
        serialNumber,
        purchaseDate,
        warrantyEndDate,
        status,
        condition,
        description,
        labId,
      } = req.body;

      // Check if equipment exists
      const existingEquipment = await equipmentService.findById(id);
      if (!existingEquipment) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment not found',
        };
        res.status(404).json(response);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;
      
      // Check campus access
      if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
        if (existingEquipment.campusId !== user.campus_id) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied: equipment belongs to different campus',
          };
          res.status(403).json(response);
          return;
        }
      }

      // If moving to different lab, verify and get new campus
      let newCampusId = existingEquipment.campusId;
      if (labId && labId !== existingEquipment.labId) {
        const lab = await labService.findById(labId);
        if (!lab) {
          const response: ApiResponse = {
            success: false,
            message: 'Lab not found',
          };
          res.status(404).json(response);
          return;
        }

        // Check if user can move to this lab's campus
        if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
          if (lab.campusId !== user.campus_id) {
            const response: ApiResponse = {
              success: false,
              message: 'Cannot move equipment to different campus',
            };
            res.status(403).json(response);
            return;
          }
        }

        newCampusId = lab.campusId;
      }

      // Check if new code conflicts with another equipment in the same campus
      if (code && code !== existingEquipment.code) {
        const equipmentWithCode = await equipmentService.findByCodeAndCampus(
          code,
          newCampusId
        );
        if (equipmentWithCode && equipmentWithCode.id !== id) {
          const response: ApiResponse = {
            success: false,
            message: 'Equipment with this code already exists in this campus',
          };
          res.status(409).json(response);
          return;
        }
      }

      const equipment = await equipmentService.update(
        id,
        {
          code,
          name,
          category,
          brand,
          serialNumber,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
          warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : undefined,
          status,
          condition,
          description,
          labId,
          campusId: newCampusId,
        },
        user.user_id
      );

      const response: ApiResponse = {
        success: true,
        data: equipment,
        message: 'Equipment updated successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Update equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Check if equipment exists
      const existingEquipment = await equipmentService.findById(id);
      if (!existingEquipment) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment not found',
        };
        res.status(404).json(response);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;
      
      // Check campus access
      if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
        if (existingEquipment.campusId !== user.campus_id) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied: equipment belongs to different campus',
          };
          res.status(403).json(response);
          return;
        }
      }

      // Soft delete
      const equipment = await equipmentService.softDelete(id);

      const response: ApiResponse = {
        success: true,
        data: equipment,
        message: 'Equipment deleted successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Delete equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }

  async restore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      // Check if equipment exists (including deleted)
      const existingEquipment = await equipmentService.findById(id, true);
      if (!existingEquipment) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment not found',
        };
        res.status(404).json(response);
        return;
      }

      if (!existingEquipment.isDeleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Equipment is not deleted',
        };
        res.status(400).json(response);
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;
      
      // Check campus access
      if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
        if (existingEquipment.campusId !== user.campus_id) {
          const response: ApiResponse = {
            success: false,
            message: 'Access denied: equipment belongs to different campus',
          };
          res.status(403).json(response);
          return;
        }
      }

      const equipment = await equipmentService.restore(id);

      const response: ApiResponse = {
        success: true,
        data: equipment,
        message: 'Equipment restored successfully',
      };

      res.json(response);
    } catch (error) {
      console.error('Restore equipment error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Internal server error',
      };
      res.status(500).json(response);
    }
  }
}

export const equipmentController = new EquipmentController();
