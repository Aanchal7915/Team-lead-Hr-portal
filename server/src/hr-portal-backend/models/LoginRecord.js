// // models/LoginRecord.js
// const mongoose = require('mongoose');

// const loginRecordSchema = new mongoose.Schema({
//     employeeId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Employee',
//         required: true,
//     },
//     action: {
//         type: String,
//         enum: ['Login', 'Check-in', 'Check-out'],
//         required: true,
//     },
//     deviceInfo: {
//         type: String,
//         required: true,
//     },
//     ipAddress: {
//         type: String,
//     },
//     // --- NEW FIELD ---
//     // This will be true if the browser reports touch capabilities.
//     isTouchDevice: {
//         type: Boolean,
//         default: false,
//     }
// }, { timestamps: true });

// loginRecordSchema.index(
//   { createdAt: 1 },
//   { expireAfterSeconds: 7776000 } // ~90 days (3 months)
// );

// const LoginRecord = mongoose.model('LegacyLoginRecord', loginRecordSchema);
// module.exports = LoginRecord;

// models/LoginRecord.js
const mongoose = require('mongoose');

const loginRecordSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  deviceModel: {
    type: String,
    default: "Unknown",
  },

  action: {
    type: String,
    enum: ['Login', 'Check-in', 'Check-out'],
    required: true,
  },
  deviceInfo: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  isTouchDevice: {
    type: Boolean,
    default: false,
  },
  // --- NEW FIELDS ---
  location: {
    type: String,
    default: 'Unknown', // e.g., "Rohtak, Haryana, India"
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  }
}, { timestamps: true });

// Auto-delete logs older than 30 days (1 month)
loginRecordSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 } // 30 days
);

const LoginRecord = mongoose.model('LegacyLoginRecord', loginRecordSchema);
module.exports = LoginRecord;
