import ActivityLog from '../models/ActivityLog.js';

export const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch logs', error: error.message });
    }
};
