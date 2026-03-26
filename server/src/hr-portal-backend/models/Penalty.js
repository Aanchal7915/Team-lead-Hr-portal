// models/Penalty.js
const mongoose = require('mongoose');

const penaltySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true }, // YYYY-MM
  reason: { type: String },
  amount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LegacyPenalty', penaltySchema);
