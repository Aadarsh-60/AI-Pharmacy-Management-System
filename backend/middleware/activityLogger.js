import ActivityLog from '../models/ActivityLog.js';

export const logActivity = (action, resource) => {
    return async (req, res, next) => {
        try {
            const log = new ActivityLog({
                userId: req.user ? req.user.id : null,
                userEmail: req.user ? req.user.email : 'Unknown',
                action,
                resource,
                details: {
                    method: req.method,
                    url: req.originalUrl,
                    body: req.method !== 'GET' ? { ...req.body, password: req.body.password ? '***' : undefined } : undefined
                },
                ipAddress: req.ip || req.connection?.remoteAddress
            });
            await log.save();
        } catch (error) {
            console.error('Error logging activity:', error);
        }
        next();
    };
};
