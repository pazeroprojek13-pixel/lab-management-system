import { NextFunction, Request, Response } from 'express';
interface HttpError extends Error {
    statusCode?: number;
}
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function errorHandler(err: HttpError, req: Request, res: Response, _next: NextFunction): void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map