import { logger } from '../lib/logger';
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
}
export function errorHandler(err, req, res, _next) {
    const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    logger.error({
        err,
        method: req.method,
        path: req.path,
        statusCode,
    }, 'Unhandled error');
    const message = statusCode >= 500 ? 'Internal server error' : err.message;
    res.status(statusCode).json({
        success: false,
        message,
    });
}
//# sourceMappingURL=error.middleware.js.map