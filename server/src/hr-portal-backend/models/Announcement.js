const mongoose = require('mongoose');


const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LegacyHR',
        required: true,
    },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

// --- NEW: TTL Index for Automatic Deletion after 1 month ---
// This tells MongoDB to automatically delete documents from this collection
// 30 days (2592000 seconds) after their 'createdAt' timestamp.
announcementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Announcement = mongoose.model('LegacyAnnouncement', announcementSchema);
module.exports = Announcement;
