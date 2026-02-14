import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { AuthRequest, ExtendedRole } from '../middleware';
import { checkResourceAccess } from '../lib/campusScope';

export class EventController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      const role = user?.role as ExtendedRole;

      // Build filter based on campus scope
      let campusFilter: string | undefined;

      // DEVELOPER and SUPER_ADMIN: No campus filter
      if (role !== 'DEVELOPER' && role !== 'SUPER_ADMIN') {
        // ADMIN: Filter by their campus
        if (role === 'ADMIN') {
          campusFilter = user.campus_id;
        }
        // USER roles: Only see events at their campus or created by them
        else {
          // Will filter at service level
        }
      }

      const events = await eventService.findAll({
        campusId: campusFilter,
        userId: (role === 'LAB_ASSISTANT' || role === 'LECTURER' || role === 'STUDENT') 
          ? user?.user_id 
          : undefined,
      });

      res.json({ events });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const event = await eventService.findById(id);

      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check campus access
      const access = checkResourceAccess(
        req.user!,
        event.campusId || undefined,
        event.createdById
      );

      if (!access.allowed) {
        res.status(403).json({ error: access.reason });
        return;
      }

      res.json({ event });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, startDate, endDate, location, campusId } = req.body;

      if (!title || !startDate || !endDate || !location) {
        res.status(400).json({ error: 'Title, startDate, endDate, and location are required' });
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      // Check if admin can create at this campus
      if (role === 'ADMIN' && campusId && campusId !== user.campus_id) {
        res.status(403).json({ error: 'Cannot create event for different campus' });
        return;
      }

      const event = await eventService.create({
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        createdById: user.user_id,
        campusId: campusId || user.campus_id,
      });

      res.status(201).json({
        message: 'Event created successfully',
        event,
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { title, description, startDate, endDate, location, campusId } = req.body;

      const existingEvent = await eventService.findById(id);
      if (!existingEvent) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check campus access
      const access = checkResourceAccess(
        req.user!,
        existingEvent.campusId || undefined,
        existingEvent.createdById
      );

      if (!access.allowed) {
        res.status(403).json({ error: access.reason });
        return;
      }

      const user = req.user!;
      const role = user.role as ExtendedRole;

      // Check if admin can move to different campus
      if (role === 'ADMIN' && campusId && campusId !== user.campus_id) {
        res.status(403).json({ error: 'Cannot move event to different campus' });
        return;
      }

      const event = await eventService.update(id, {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        campusId,
      });

      res.json({
        message: 'Event updated successfully',
        event,
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const existingEvent = await eventService.findById(id);
      if (!existingEvent) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Check campus access
      const access = checkResourceAccess(
        req.user!,
        existingEvent.campusId || undefined,
        existingEvent.createdById
      );

      if (!access.allowed) {
        res.status(403).json({ error: access.reason });
        return;
      }

      await eventService.delete(id);

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const eventController = new EventController();
