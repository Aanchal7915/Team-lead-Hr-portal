const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    leaveDate: {
        type: Date,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Declined'],
        default: 'Pending',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HR',
    }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

// --- NEW: TTL Index for Automatic Deletion ---
// This tells MongoDB to automatically delete documents from this collection
// 60 days (5184000 seconds) after they are created.
leaveRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 18144000 }); //7 months 

const LeaveRequest = mongoose.model('LegacyLeaveRequest', leaveRequestSchema);
module.exports = LeaveRequest;