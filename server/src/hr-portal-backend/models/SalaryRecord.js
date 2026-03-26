// const mongoose = require('mongoose');

// const salaryRecordSchema = new mongoose.Schema({
//     month: { type: Number, required: true }, // e.g., 6 for July
//     year: { type: Number, required: true },
//     notes: { type: String },
//     payrollData: [{
//         employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
//         employeeName: String,
//         baseSalary: Number,
//         unpaidLeaves: Number,
//         deductions: Number,
//         netSalary: Number,
//     }],
//     creditedOn: { type: Date, default: Date.now }
// }, { timestamps: true });

// const SalaryRecord = mongoose.model('LegacySalaryRecord', salaryRecordSchema);
// module.exports = SalaryRecord;

const mongoose = require('mongoose');

// This defines the structure for each employee's entry within a single payroll record.
const payrollEntrySchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: String,
    baseSalary: Number,
    unpaidLeaves: Number,
    deductions: Number,
    netSalary: Number,
}, { _id: false }); // We don't need a separate _id for each entry in the array

// This is the main schema for the entire monthly record.
const salaryRecordSchema = new mongoose.Schema({
    month: { type: Number, required: true }, // e.g., 7 for July
    year: { type: Number, required: true },
    notes: { type: String },
    payrollData: [payrollEntrySchema], // This correctly uses the sub-schema defined above
    creditedOn: { type: Date, default: Date.now }
}, { timestamps: true });

const SalaryRecord = mongoose.model('LegacySalaryRecord', salaryRecordSchema);
module.exports = SalaryRecord;
