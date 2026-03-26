const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half Day', 'On Leave'],
        default: 'Present'
    },
    dayType: { // Full/Half
        type: String,
    },
    deviceInfo: {
        type: String
    },
    ipAddress: {
        type: String
    },
    location: {
        lat: Number,
        lng: Number
    },
    eodReport: {
        type: String
    },
    isLate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Compound index to ensure 1 attendance record per user per day max
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
