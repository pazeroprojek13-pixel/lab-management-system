import { NextFunction, Request, Response } from 'express';
import { appConfig } from '../config/app';

export function validateCronSecret(req: Request, res: Response, next: NextFunction): void {
  const expected = appConfig.cron.secret;

  // Optional validation: if no secret configured, allow requests.
  if (!expected) {
    next();
    return;
  }

  const headerSecret = req.header('x-cron-secret');
  const bearer = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const provided = headerSecret || bearer;

  if (!provided || provided !== expected) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized cron request',
    });
    return;
  }

  next();
}
