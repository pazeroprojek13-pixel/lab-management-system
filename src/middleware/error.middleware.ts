import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';

interface HttpError extends Error {
  statusCode?: number;
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  logger.error(
    {
      err,
      method: req.method,
      path: req.path,
      statusCode,
    },
    'Unhandled error'
  );

  const message = statusCode >= 500 ? 'Internal server error' : err.message;
  res.status(statusCode).json({
    success: false,
    message,
  });
}
