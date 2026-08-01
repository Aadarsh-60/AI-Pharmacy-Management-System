import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    userEmail: { type: String, required: false },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    details: { type: Object, default: {} },
    ipAddress: { type: String },
}, {
    timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
