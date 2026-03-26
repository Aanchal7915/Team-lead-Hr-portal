const SalarySlip = require('../models/SalarySlip');
const Employee = require('../models/Employee');
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

// @desc    Generate salary slips automatically for all or selected employees
// @route   POST /api/hr/salary-slips/generate
// @access  Private/HR
const generateSalarySlips = async (req, res) => {
    try {
        const { month, year, employeeIds, notes, companyName, companyAddress, companyGst, authorizedSignatory, companyStamp, authorizedSignatoryImage, companyStampImage } = req.body;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Determine which employees to generate slips for
        let employees;
        if (employeeIds && employeeIds.length > 0) {
            // Generate for selected employees
            employees = await Employee.find({
                _id: { $in: employeeIds },
                status: 'Active'
            });
        } else {
            // Generate for all active employees
            employees = await Employee.find({ status: 'Active' });
        }

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No active employees found' });
        }

        const generatedSlips = [];
        const errors = [];

        for (const employee of employees) {
            try {
                // Check if slip already exists
                const existingSlip = await SalarySlip.findOne({
                    employee: employee._id,
                    month,
                    year
                });

                if (existingSlip) {
                    errors.push({
                        employeeId: employee.employeeId,
                        name: employee.name,
                        message: 'Salary slip already exists'
                    });
                    continue;
                }

                // Calculate Attendance for the month
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0); // Last day of month

                const attendanceRecords = await Attendance.find({
                    employee: employee._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                const presentDays = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
                const absentDays = attendanceRecords.filter(r => r.status === 'Absent').length;
                const totalWorkingDays = attendanceRecords.length || endDate.getDate(); // Default to total days if no records

                // Create new salary slip
                const salarySlip = await SalarySlip.create({
                    employee: employee._id,
                    employeeName: employee.name,
                    employeeEmail: employee.email,
                    employeePhone: employee.phone || '',
                    employeeCode: employee.employeeId,
                    department: employee.department,
                    month,
                    year,
                    baseSalary: employee.salary || 0,
                    adjustments: [],
                    netSalary: employee.salary || 0,
                    isApproved: false,
                    isEdited: false,
                    generatedBy: req.user._id,
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
                    balanceDue: employee.salary || 0,
                    paymentStatus: 'Pending',
                    totalAdditions: 0,
                    totalDeductions: 0,
                    employeeExpenses: []
                });

                generatedSlips.push(salarySlip);
            } catch (error) {
                errors.push({
                    employeeId: employee.employeeId,
                    name: employee.name,
                    message: error.message
                });
            }
        }

        res.status(201).json({
            message: `Generated ${generatedSlips.length} salary slips`,
            slips: generatedSlips,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error generating salary slips:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all salary slips (with filtering)
// @route   GET /api/hr/salary-slips
// @access  Private/HR
const getSalarySlips = async (req, res) => {
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

        const formattedSlips = salarySlips.map(slip => {
            const emp = slip.employee || {};
            const empBank = emp.bankDetails || {};
            const slipBank = slip.employeeBankDetails || {};

            // Merge details: Slip details take precedence, falling back to Employee profile details
            const mergedBankDetails = {
                accountNumber: slipBank.accountNumber || empBank.accountNumber || '',
                ifscCode: slipBank.ifscCode || empBank.ifscCode || '',
                bankName: slipBank.bankName || empBank.bankName || '',
                accountHolderName: slipBank.accountHolderName || empBank.accountHolderName || '',
                upiId: slipBank.upiId || emp.upiId || '',
                panCardNumber: slipBank.panCardNumber || emp.panCardNumber || ''
            };

            return {
                ...slip.toObject(),
                employeeName: slip.employeeName || emp.name || 'Unknown',
                employeeCode: slip.employeeCode || emp.employeeId || 'N/A',
                department: slip.department || emp.department || 'N/A',
                employeeBankDetails: mergedBankDetails
            };
        });

        res.status(200).json(formattedSlips);
    } catch (error) {
        console.error('Error fetching salary slips:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single salary slip by ID
// @route   GET /api/hr/salary-slips/:id
// @access  Private/HR
const getSalarySlipById = async (req, res) => {
    try {
        const salarySlip = await SalarySlip.findById(req.params.id)
            .populate('employee', 'name email department employeeId phone')
            .populate('approvedBy', 'name')
            .populate('generatedBy', 'name');

        if (!salarySlip) {
            return res.status(404).json({ message: 'Salary slip not found' });
        }

        res.status(200).json(salarySlip);
    } catch (error) {
        console.error('Error fetching salary slip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update salary slip (adjustments, bank details, payments, etc.)
// @route   PUT /api/hr/salary-slips/:id
// @access  Private/HR
const updateSalarySlip = async (req, res) => {
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
            companyStampImage
        } = req.body;

        const salarySlip = await SalarySlip.findById(req.params.id);

        if (!salarySlip) {
            return res.status(404).json({ message: 'Salary slip not found' });
        }

        if (adjustments) salarySlip.adjustments = adjustments;
        if (notes !== undefined) salarySlip.notes = notes;
        if (companyName) salarySlip.companyName = companyName;
        if (companyAddress) salarySlip.companyAddress = companyAddress;
        if (companyGst !== undefined) salarySlip.companyGst = companyGst;
        if (employeeBankDetails) {
            salarySlip.employeeBankDetails = { ...salarySlip.employeeBankDetails, ...employeeBankDetails };

            // Sync bank details to Employee model
            await Employee.findByIdAndUpdate(salarySlip.employee, {
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
        if (req.body.employeeExpenses !== undefined) salarySlip.employeeExpenses = req.body.employeeExpenses;

        salarySlip.isEdited = true;

        // Recalculate Totals
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

        // Add employee expenses to net salary (reimbursement)
        const totalExpenses = (salarySlip.employeeExpenses || []).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        netSalary += totalExpenses;
        additions += totalExpenses;

        salarySlip.netSalary = Math.max(0, netSalary);
        salarySlip.totalAdditions = additions;
        salarySlip.totalDeductions = deductions;

        // Recalculate Payment Status and Balance
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

        res.status(200).json(updatedSlip);
    } catch (error) {
        console.error('Error updating salary slip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve salary slips (single or multiple)
// @route   POST /api/hr/salary-slips/approve
// @access  Private/HR
const approveSalarySlips = async (req, res) => {
    try {
        const { slipIds } = req.body;

        if (!slipIds || !Array.isArray(slipIds) || slipIds.length === 0) {
            return res.status(400).json({ message: 'Slip IDs are required' });
        }

        const result = await SalarySlip.updateMany(
            { _id: { $in: slipIds }, isApproved: false },
            {
                $set: {
                    isApproved: true,
                    approvedBy: req.user._id,
                    approvedAt: new Date()
                }
            }
        );

        res.status(200).json({
            message: `Approved ${result.modifiedCount} salary slips`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error approving salary slips:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete salary slip
// @route   DELETE /api/hr/salary-slips/:id
// @access  Private/HR
const deleteSalarySlip = async (req, res) => {
    try {
        const salarySlip = await SalarySlip.findById(req.params.id);

        if (!salarySlip) {
            return res.status(404).json({ message: 'Salary slip not found' });
        }

        // Removed restriction on deleting approved salary slips as per user request

        await salarySlip.deleteOne();

        res.status(200).json({ message: 'Salary slip deleted successfully' });
    } catch (error) {
        console.error('Error deleting salary slip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get employee's own salary slips
// @route   GET /api/employee/salary-slips
// @access  Private/Employee
const getEmployeeSalarySlips = async (req, res) => {
    try {
        let isHrAdmin = false;
        if (req.user && req.user.email) {
            const HR = require('../models/HR');
            const hrDoc = await HR.findOne({ email: req.user.email });
            if (hrDoc) isHrAdmin = true;
        }

        let employee = await Employee.findById(req.user._id);
        if (!employee && req.user.email) employee = await Employee.findOne({ email: req.user.email });
        
        // Remove console log and proceed
        let query = { isApproved: true };

        if (!isHrAdmin) {
            if (!employee) return res.status(200).json([]);
            query.employee = employee._id; // Filter to personal slips
        }

        const salarySlips = await SalarySlip.find(query)
            .select('-generatedBy -approvedBy')
            .sort({ year: -1, month: -1 });

        res.status(200).json(salarySlips);
    } catch (error) {
        console.error('Error fetching employee salary slips:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single salary slip for employee
// @route   GET /api/employee/salary-slips/:id
// @access  Private/Employee
const getEmployeeSalarySlipById = async (req, res) => {
    try {
        let employee = await Employee.findById(req.user._id);
        if (!employee && req.user.email) employee = await Employee.findOne({ email: req.user.email });
        if (!employee) return res.status(404).json({ message: 'Salary slip not found' });

        const salarySlip = await SalarySlip.findOne({
            _id: req.params.id,
            employee: employee._id,
            isApproved: true
        }).select('-generatedBy -approvedBy');

        if (!salarySlip) {
            return res.status(404).json({ message: 'Salary slip not found or not approved' });
        }

        res.status(200).json(salarySlip);
    } catch (error) {
        console.error('Error fetching salary slip:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Upload signature or stamp
const uploadSalarySlipAsset = async (req, res) => {
    let localFilePath;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        localFilePath = req.file.path;

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
            removeTempFile(localFilePath);
            return res.status(500).json({ message: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME.' });
        }

        const folder = process.env.CLOUDINARY_SALARY_SLIP_FOLDER || 'hr-portal/salary-slip-assets';
        const payload = getCloudinaryUploadPayload({ reqFile: req.file, folder });
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

        const formData = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            formData.append(key, String(value));
        });

        const { data } = await axios.post(uploadUrl, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        removeTempFile(localFilePath);

        // Keep `filePath` for backward compatibility with existing frontend usage.
        const filePath = data.secure_url;
        res.status(200).json({
            filePath,
            secure_url: data.secure_url,
            public_id: data.public_id
        });
    } catch (error) {
        removeTempFile(localFilePath);
        console.error('Error uploading asset:', error);
        res.status(500).json({
            message: 'Failed to upload salary slip asset to Cloudinary',
            error: error.response?.data?.error?.message || error.message
        });
    }
};

// @desc    Get latest company info (name, address, gst, signatory, stamp) for prefilling
const getLatestCompanyInfo = async (req, res) => {
    try {
        const latestSlip = await SalarySlip.findOne().sort({ createdAt: -1 });

        if (!latestSlip) {
            return res.status(200).json({
                companyName: 'Avani Enterprises',
                companyAddress: 'Soniya Vihar, Delhi',
                companyGst: '',
                authorizedSignatory: 'Director',
                companyStamp: 'AVANI ENTERPRISES',
                authorizedSignatoryImage: '',
                companyStampImage: ''
            });
        }

        res.status(200).json({
            companyName: latestSlip.companyName,
            companyAddress: latestSlip.companyAddress,
            companyGst: latestSlip.companyGst,
            authorizedSignatory: latestSlip.authorizedSignatory,
            companyStamp: latestSlip.companyStamp,
            authorizedSignatoryImage: latestSlip.authorizedSignatoryImage,
            companyStampImage: latestSlip.companyStampImage
        });
    } catch (error) {
        console.error('Error fetching latest company info:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    generateSalarySlips,
    getSalarySlips,
    getSalarySlipById,
    updateSalarySlip,
    approveSalarySlips,
    deleteSalarySlip,
    getEmployeeSalarySlips,
    getEmployeeSalarySlipById,
    uploadSalarySlipAsset,
    getLatestCompanyInfo
};

// ... keep original code but add the new functions before module.exports or just append them and fix module.exports

