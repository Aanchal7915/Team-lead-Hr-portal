const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    // We will only ever have one document with this key
    configKey: { type: String, default: 'main', unique: true },
    lastLeaveReset: {
        month: Number, // e.g., 7 for July
        year: Number,
    }
}, { timestamps: true });

const SystemConfig = mongoose.model('LegacySystemConfig', systemConfigSchema);
module.exports = SystemConfig;