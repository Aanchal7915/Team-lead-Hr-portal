const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['addition', 'deduction'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['Bank Transfer', 'Cash', 'UPI', 'Cheque'], default: 'Bank Transfer' },
    referenceId: String,
    notes: String
}, { _id: true });

const employeeExpenseSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: String
}, { _id: true });

const salarySlipSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeName: { type: String, required: true },
    employeeCode: { type: String, default: '' },
    department:   { type: String, default: 'General' },
    designation:  { type: String, default: '' },
    month:        { type: Number, required: true },   // 1-12
    year:         { type: Number, required: true },
    baseSalary:         { type: Number, default: 0 },
    adjustments: [adjustmentSchema],
    netSalary:          { type: Number, default: 0 },
    isApproved: {
        type: Boolean,
        default: false
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    generatedAt: { type: Date, default: Date.now },
    notes: {
        type: String,
        default: ''
    },
    companyName: {
        type: String,
        default: 'Avani Enterprises'
    },
    companyAddress: {
        type: String,
        default: 'Soniya Vihar, Delhi'
    },
    companyGst: {
        type: String,
        default: ''
    },
    employeePhone: { type: String, default: '' },
    employeeEmail: { type: String, default: '' },
    employeeBankDetails: {
        accountNumber: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        bankName: { type: String, default: '' },
        accountHolderName: { type: String, default: '' },
        upiId: { type: String, default: '' },
        panCardNumber: { type: String, default: '' }
    },
    attendance: {
        totalWorkingDays: { type: Number, default: 0 },
        presentDays: { type: Number, default: 0 },
        absentDays: { type: Number, default: 0 }
    },
    payments: [paymentSchema],
    employeeExpenses: [employeeExpenseSchema],
    totalAdditions: {
        type: Number,
        default: 0
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    totalPaid: {
        type: Number,
        default: 0
    },
    balanceDue: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Completed'],
        default: 'Pending'
    },
    authorizedSignatory: {
        type: String,
        default: 'Director'
    },
    companyStamp: {
        type: String,
        default: 'AVANI ENTERPRISES'
    },
    authorizedSignatoryImage: {
        type: String,
        default: ''
    },
    companyStampImage: {
        type: String,
        default: ''
    },
    // Legacy fields (kept for backward compat)
    amount:      { type: Number, default: 0 },
    documentUrl: { type: String, default: '' },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Compound index to ensure one slip per employee per month/year
salarySlipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('SalarySlip', salarySlipSchema);
