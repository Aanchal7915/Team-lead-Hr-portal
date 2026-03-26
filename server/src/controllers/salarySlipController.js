const SalarySlip = require('../models/SalarySlip');
const User = require('../hr-portal-backend/models/Employee');
const Attendance = require('../models/Attendance');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

const removeTempFile = (filePath) => {
    if (!filePath) return;
    fs.unlink(filePath, () => { });
};

const getCloudinaryUploadPayload = ({ reqFile, folder }) => {
    const fileBuffer = fs.readFileSync(reqFile.path);
    const base64File = `data:${reqFile.mimetype};base64,${fileBuffer.toString('base64')}`;
    const payload = {
        file: base64File,
        folder
    };

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (uploadPreset) {
        payload.upload_preset = uploadPreset;
        return payload;
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new Error('Cloudinary config missing. Set CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureSource = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureSource).digest('hex');

    payload.timestamp = timestamp;
    payload.api_key = apiKey;
    payload.signature = signature;

    return payload;
};

// ─── HR Admin: generate slips ────────────────────────────────────────────────
exports.generateSalarySlips = async (req, res) => {
    try {
        const { month, year, employeeIds, notes, companyName, companyAddress, companyGst, authorizedSignatory, companyStamp, authorizedSignatoryImage, companyStampImage } = req.body;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Month and year are required' });
        }
        console.log(employeeIds)
        let employees;
        if (employeeIds && employeeIds.length > 0) {
            employees = await User.find({ _id: { $in: employeeIds } });
        } else {
            employees = await User.find({ status: 'Active' });
        }

        if (employees.length === 0) {
            return res.status(404).json({ success: false, message: 'No employees found' });
        }

        const generatedSlips = [];
        const errors = [];

        for (const employee of employees) {
            try {
                const existingSlip = await SalarySlip.findOne({
                    employee: employee._id,
                    month,
                    year
                });

                if (existingSlip) {
                    errors.push({
                        employeeId: employee.employeeId || employee._id,
                        name: employee.name,
                        message: 'Salary slip already exists'
                    });
                    continue;
                }

                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);

                const attendanceRecords = await Attendance.find({
                    employee: employee._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                const presentDays = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
                const absentDays = attendanceRecords.filter(r => r.status === 'Absent').length;
                const totalWorkingDays = attendanceRecords.length || endDate.getDate();

                const salarySlip = await SalarySlip.create({
                    employee: employee._id,
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                    employeePhone: employee.phone || '',
                    employeeCode: employee.employeeId || '',
                    department: employee.department || 'General',
                    month,
                    year,
                    baseSalary: employee.baseSalary || employee.salary || 0,
                    adjustments: [],
                    netSalary: employee.baseSalary || employee.salary || 0,
                    isApproved: false,
                    isEdited: false,
                    generatedBy: req.user._id || req.user.id,
                    notes: notes || '',
                    companyName: companyName || 'Avani Enterprises',
                    companyAddress: companyAddress || 'Soniya Vihar, Delhi',
                    companyGst: companyGst || '',
                    authorizedSignatory: authorizedSignatory || 'Director',
                    companyStamp: companyStamp || 'AVANI ENTERPRISES',
                    authorizedSignatoryImage: authorizedSignatoryImage || '',
                    companyStampImage: companyStampImage || '',
                    employeeBankDetails: {
                        accountNumber: employee.bankDetails?.accountNumber || '',
                        ifscCode: employee.bankDetails?.ifscCode || '',
                        bankName: employee.bankDetails?.bankName || '',
                        accountHolderName: employee.bankDetails?.accountHolderName || '',
                        upiId: employee.upiId || '',
                        panCardNumber: employee.panCardNumber || ''
                    },
                    attendance: {
                        totalWorkingDays,
                        presentDays,
                        absentDays
                    },
                    balanceDue: employee.baseSalary || employee.salary || 0,
                    paymentStatus: 'Pending',
                    totalAdditions: 0,
                    totalDeductions: 0,
                    employeeExpenses: []
                });

                generatedSlips.push(salarySlip);
            } catch (error) {
                errors.push({
                    employeeId: employee.employeeId || employee._id,
                    name: employee.name,
                    message: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: `Generated ${generatedSlips.length} salary slips`,
            data: generatedSlips,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error generating salary slips:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── HR Admin: list all slips ─────────────────────────────────────────────────
exports.getAllSalarySlips = async (req, res) => {
    try {
        const { month, year, isApproved, employeeId } = req.query;
        let query = {};

        if (month) query.month = parseInt(month);
        if (year) query.year = parseInt(year);
        if (isApproved !== undefined) query.isApproved = isApproved === 'true';
        if (employeeId) query.employee = employeeId;

        const salarySlips = await SalarySlip.find(query)
            .populate('employee', 'name employeeId department bankDetails gstNumber panCardNumber upiId')
            .sort({ year: -1, month: -1 });

        res.status(200).json({ success: true, data: salarySlips });
    } catch (error) {
        console.error('Error fetching salary slips:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── HR Admin: get single slip ───────────────────────────────────────────────
exports.getSalarySlipById = async (req, res) => {
    try {
        const salarySlip = await SalarySlip.findById(req.params.id)
            .populate('employee', 'name email department employeeId phone')
            .populate('approvedBy', 'name')
            .populate('generatedBy', 'name');

        if (!salarySlip) {
            return res.status(404).json({ success: false, message: 'Salary slip not found' });
        }

        res.status(200).json({ success: true, data: salarySlip });
    } catch (error) {
        console.error('Error fetching salary slip:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── HR Admin: update slip ──────────────────────────────────────────────────
exports.updateSalarySlip = async (req, res) => {
    try {
        const {
            adjustments,
            notes,
            companyName,
            companyAddress,
            companyGst,
            employeeBankDetails,
            payments,
            attendance,
            employeeEmail,
            employeePhone,
            authorizedSignatory,
            companyStamp,
            authorizedSignatoryImage,
            companyStampImage,
            employeeExpenses
        } = req.body;

        const salarySlip = await SalarySlip.findById(req.params.id);

        if (!salarySlip) {
            return res.status(404).json({ success: false, message: 'Salary slip not found' });
        }

        if (adjustments) salarySlip.adjustments = adjustments;
        if (notes !== undefined) salarySlip.notes = notes;
        if (companyName) salarySlip.companyName = companyName;
        if (companyAddress) salarySlip.companyAddress = companyAddress;
        if (companyGst !== undefined) salarySlip.companyGst = companyGst;
        if (employeeBankDetails) {
            salarySlip.employeeBankDetails = { ...salarySlip.employeeBankDetails, ...employeeBankDetails };

            await User.findByIdAndUpdate(salarySlip.employee, {
                $set: {
                    'bankDetails.accountNumber': employeeBankDetails.accountNumber,
                    'bankDetails.ifscCode': employeeBankDetails.ifscCode,
                    'bankDetails.bankName': employeeBankDetails.bankName,
                    'bankDetails.accountHolderName': employeeBankDetails.accountHolderName,
                    'upiId': employeeBankDetails.upiId,
                    'panCardNumber': employeeBankDetails.panCardNumber
                }
            });
        }
        if (payments) salarySlip.payments = payments;
        if (attendance) salarySlip.attendance = attendance;
        if (employeeEmail) salarySlip.employeeEmail = employeeEmail;
        if (employeePhone) salarySlip.employeePhone = employeePhone;
        if (authorizedSignatory) salarySlip.authorizedSignatory = authorizedSignatory;
        if (companyStamp) salarySlip.companyStamp = companyStamp;
        if (authorizedSignatoryImage !== undefined) salarySlip.authorizedSignatoryImage = authorizedSignatoryImage;
        if (companyStampImage !== undefined) salarySlip.companyStampImage = companyStampImage;
        if (employeeExpenses !== undefined) salarySlip.employeeExpenses = employeeExpenses;

        salarySlip.isEdited = true;

        let netSalary = salarySlip.baseSalary;
        let additions = 0;
        let deductions = 0;

        (salarySlip.adjustments || []).forEach(adj => {
            const amount = Number(adj.amount) || 0;
            if (adj.type === 'addition') {
                netSalary += amount;
                additions += amount;
            } else if (adj.type === 'deduction') {
                netSalary -= amount;
                deductions += amount;
            }
        });

        const totalExpenses = (salarySlip.employeeExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        netSalary += totalExpenses;
        additions += totalExpenses;

        salarySlip.netSalary = Math.max(0, netSalary);
        salarySlip.totalAdditions = additions;
        salarySlip.totalDeductions = deductions;

        const totalPaid = (salarySlip.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        salarySlip.totalPaid = totalPaid;
        salarySlip.balanceDue = Math.max(0, salarySlip.netSalary - totalPaid);

        if (salarySlip.balanceDue <= 0 && salarySlip.netSalary > 0) {
            salarySlip.paymentStatus = 'Completed';
        } else if (totalPaid > 0) {
            salarySlip.paymentStatus = 'Partial';
        } else {
            salarySlip.paymentStatus = 'Pending';
        }

        await salarySlip.save();

        const updatedSlip = await SalarySlip.findById(salarySlip._id)
            .populate('employee', 'name email department employeeId phone')
            .populate('approvedBy', 'name');

        res.status(200).json({ success: true, data: updatedSlip });
    } catch (error) {
        console.error('Error updating salary slip:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── HR Admin: approve slips ────────────────────────────────────────────────
exports.approveSalarySlips = async (req, res) => {
    try {
        const { slipIds } = req.body;

        if (!slipIds || !Array.isArray(slipIds) || slipIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Slip IDs are required' });
        }

        const result = await SalarySlip.updateMany(
            { _id: { $in: slipIds }, isApproved: false },
            {
                $set: {
                    isApproved: true,
                    approvedBy: req.user._id || req.user.id,
                    approvedAt: new Date()
                }
            }
        );

        res.status(200).json({
            success: true,
            message: `Approved ${result.modifiedCount} salary slips`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error approving salary slips:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── HR Admin: delete slip ────────────────────────────────────────────────────
exports.deleteSalarySlip = async (req, res) => {
    try {
        const salarySlip = await SalarySlip.findById(req.params.id);
        if (!salarySlip) return res.status(404).json({ success: false, message: 'Salary slip not found' });
        await salarySlip.deleteOne();
        res.status(200).json({ success: true, message: 'Salary slip deleted successfully' });
    } catch (error) {
        console.error('Error deleting salary slip:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Employee: view own slips ─────────────────────────────────────────────────
exports.getMySalarySlips = async (req, res) => {
    try {
        const salarySlips = await SalarySlip.find({
            employee: req.user._id || req.user.id,
            isApproved: true
        })
            .select('-generatedBy -approvedBy')
            .sort({ year: -1, month: -1 });

        res.status(200).json({ success: true, data: salarySlips });
    } catch (error) {
        console.error('Error fetching employee salary slips:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// ─── Asset Upload ───────────────────────────────────────────────────────────
exports.uploadSalarySlipAsset = async (req, res) => {
    let localFilePath;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        localFilePath = req.file.path;

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
            removeTempFile(localFilePath);
            return res.status(500).json({ success: false, message: 'Cloudinary is not configured.' });
        }

        const folder = process.env.CLOUDINARY_SALARY_SLIP_FOLDER || 'main-portal/salary-slip-assets';
        const payload = getCloudinaryUploadPayload({ reqFile: req.file, folder });
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const { data } = await axios.post(uploadUrl, formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        removeTempFile(localFilePath);
        res.status(200).json({ success: true, filePath: data.secure_url });
    } catch (error) {
        removeTempFile(localFilePath);
        console.error('Error uploading asset:', error);
        res.status(500).json({ success: false, message: 'Failed to upload asset', error: error.message });
    }
};

// ─── Latest Info ─────────────────────────────────────────────────────────────
exports.getLatestCompanyInfo = async (req, res) => {
    try {
        const latestSlip = await SalarySlip.findOne().sort({ createdAt: -1 });
        if (!latestSlip) {
            return res.status(200).json({
                success: true,
                data: {
                    companyName: 'Avani Enterprises',
                    companyAddress: 'Soniya Vihar, Delhi',
                    companyGst: '',
                    authorizedSignatory: 'Director',
                    companyStamp: 'AVANI ENTERPRISES',
                    authorizedSignatoryImage: '',
                    companyStampImage: ''
                }
            });
        }
        res.status(200).json({
            success: true,
            data: {
                companyName: latestSlip.companyName,
                companyAddress: latestSlip.companyAddress,
                companyGst: latestSlip.companyGst,
                authorizedSignatory: latestSlip.authorizedSignatory,
                companyStamp: latestSlip.companyStamp,
                authorizedSignatoryImage: latestSlip.authorizedSignatoryImage,
                companyStampImage: latestSlip.companyStampImage
            }
        });
    } catch (error) {
        console.error('Error fetching latest info:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
