import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { appConfig } from './config/app';
import { httpLogger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import campusRoutes from './routes/campus.routes';
import equipmentRoutes from './routes/equipment.routes';
import eventRoutes from './routes/event.routes';
import inventoryRoutes from './routes/inventory.routes';
import incidentRoutes from './routes/incident.routes';
import labRoutes from './routes/lab.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import cronRoutes from './routes/cron.routes';

const app: Application = express();

const authLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests, please try again later.',
  },
});

const reportsLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.reportsMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many report requests, please try again later.',
  },
});

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server/no-origin requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (appConfig.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
  })
);
app.use(httpLogger);
app.use(express.json({ limit: appConfig.jsonLimit }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsLimiter, reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
