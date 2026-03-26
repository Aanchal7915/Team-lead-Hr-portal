const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const SalarySlip = require('../models/SalarySlip');
const Announcement = require('../models/Announcement');
const cloudinary = require('cloudinary').v2;
const LegacyEmployee = require('../hr-portal-backend/models/Employee');

const getOrCreateEmployeeFromAuthUser = async (authUser) => {
    if (!authUser) return null;

    let employee = await LegacyEmployee.findById(authUser.id).select('-password');
    if (employee) return employee;

    if (authUser.email) {
        employee = await LegacyEmployee.findOne({ email: authUser.email }).select('-password');
        if (employee) return employee;
    }

    if (!authUser.email) return null;

    employee = await LegacyEmployee.create({
        name: authUser.name || 'Employee',
        email: authUser.email,
        password: Math.random().toString(36).slice(2) + Date.now().toString(36),
        department: authUser.role === 'hr' ? 'HR' : 'General',
        phone: authUser.phone || '',
        address: authUser.address || ''
    });
    return employee;
};

exports.getProfile = async (req, res) => {
    try {
        const employee = await getOrCreateEmployeeFromAuthUser(req.user);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
        return res.status(200).json({ success: true, data: employee });
    } catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadRes = await cloudinary.uploader.upload(dataURI, {
            folder: 'teamlead/employee-documents',
            resource_type: 'auto'
        });

        return res.status(200).json({
            success: true,
            data: { secure_url: uploadRes.secure_url }
        });
    } catch (error) {
        console.error('Upload Document Error:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { dayType, device, ip, location } = req.body;
        const employee = req.user.id;
        
        // Strip time to get pure date for querying
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already checked in today
        const existing = await Attendance.findOne({ employee, date: today });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already checked in today' });
        }

        // Logic for "isLate" (e.g., if after 9:30 AM)
        const checkInTime = new Date();
        const isLate = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30);

        const attendance = await Attendance.create({
            employee,
            date: today,
            checkInTime,
            dayType,
            deviceInfo: device,
            ipAddress: ip,
            location: location,
            isLate
        });

        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { eodReport } = req.body;
        const employee = req.user.id;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ employee, date: today });
        if (!attendance) {
            return res.status(400).json({ success: false, message: 'No check-in record found for today' });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({ success: false, message: 'Already checked out today' });
        }

        attendance.checkOutTime = new Date();
        attendance.eodReport = eodReport;
        await attendance.save();

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const employee = req.user.id;
        // Provide mock stats for fast integration
        const totalPresent = await Attendance.countDocuments({ employee, status: 'Present' });
        const totalLeaves = await Leave.countDocuments({ employee, status: 'Approved' });
        
        // Determine current status for the UI
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaysRecord = await Attendance.findOne({ employee, date: today });
        
        let currentStatus = 'Not Checked In';
        let checkInTime = null;
        if (todaysRecord) {
            currentStatus = todaysRecord.checkOutTime ? 'Checked Out' : 'Checked In';
            checkInTime = todaysRecord.checkInTime;
        }

        res.status(200).json({ 
            success: true, 
            data: {
                stats: { present: totalPresent, leaves: totalLeaves, attendance: 95 },
                currentStatus,
                checkInTime
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLeaves = async (req, res) => {
    try {
        const employee = req.user.id;
        const leaves = await Leave.find({ employee }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const employee = req.user.id;

        const leave = await Leave.create({
            employee, type, startDate, endDate, reason
        });

        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getRankings = async (req, res) => {
    try {
        // Mock Rankings Logic
        res.status(200).json({ 
            success: true, 
            data: {
                currentRank: 3,
                totalEmployees: 45,
                score: 92.5,
                percentile: 94,
                topPerformers: [
                    { name: 'Sarah Ahmed', score: 98.2, rank: 1 },
                    { name: 'John Doe', score: 95.0, rank: 2 },
                    { name: req.user.name, score: 92.5, rank: 3 },
                    { name: 'Michael Chen', score: 89.4, rank: 4 },
                    { name: 'Emma Wilson', score: 88.1, rank: 5 }
                ]
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getSalarySlips = async (req, res) => {
    try {
        const employee = req.user.id;
        const slips = await SalarySlip.find({ employee }).sort({ createdAt: -1 });
        
        const formatted = slips.map(s => ({
            id: s._id,
            month: s.month,
            generatedOn: s.createdAt.toISOString().split('T')[0],
            amount: `₹ ${s.amount.toLocaleString()}`,
            status: s.status,
            documentUrl: s.documentUrl
        }));
        
        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const employee = await getOrCreateEmployeeFromAuthUser(req.user);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        const updateData = { ...req.body };

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
            const uploadRes = await cloudinary.uploader.upload(dataURI, { folder: 'teamlead/avatars' });
            updateData.profilePictureUrl = uploadRes.secure_url;
        }

        const updatedEmployee = await LegacyEmployee.findByIdAndUpdate(
            employee._id,
            { $set: updateData },
            { new: true, runValidators: false, strict: false }
        ).select('-password').lean();

        res.status(200).json({ success: true, data: updatedEmployee });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getEmployeeAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            status: 'Active',
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate('author', 'name role')
            .sort({ pinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('Get Employee Announcements Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
