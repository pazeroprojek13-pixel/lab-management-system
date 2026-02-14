import { verifyToken } from '../lib/jwt';
export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map