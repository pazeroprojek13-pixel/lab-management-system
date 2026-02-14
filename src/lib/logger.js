import pino from 'pino';
import pinoHttp from 'pino-http';
import { appConfig } from '../config/app';
export const logger = pino({
    level: process.env.LOG_LEVEL || (appConfig.isProduction ? 'info' : 'debug'),
    redact: ['req.headers.authorization'],
    transport: appConfig.isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});
export const httpLogger = pinoHttp({
    logger,
    autoLogging: {
        ignore: (req) => req.url === '/health',
    },
    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        return 'info';
    },
});
//# sourceMappingURL=logger.js.map