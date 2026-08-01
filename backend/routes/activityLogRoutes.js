import express from 'express';
import { getActivityLogs } from '../controllers/activityLogController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Only admin can view activity logs
router.get('/', isAuthenticated, authorizeRoles('admin'), getActivityLogs);

export default router;
