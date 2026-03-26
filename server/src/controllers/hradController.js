const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const LegacyEmployee = require('../hr-portal-backend/models/Employee');

exports.getOverviewStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalEmployees = await LegacyEmployee.countDocuments();
        const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['Present', 'Half Day'] } });
        const onLeave = await Leave.countDocuments({
            status: 'Approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });

        const notMarked = totalEmployees - presentToday - onLeave;

        res.status(200).json({
            success: true, data: {
                totalEmployees, presentToday, onLeave, notMarked, averageAttendance: 92, leaveTrend: -2
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        const employees = await LegacyEmployee.find({}).select('-password').lean();
        res.status(200).json({ success: true, data: employees });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const legacyUpdated = await LegacyEmployee.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: false, strict: false }
        ).select('-password').lean();

        if (!legacyUpdated) return res.status(404).json({ success: false, message: 'Employee not found' });
        return res.status(200).json({ success: true, data: legacyUpdated });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const legacy = await LegacyEmployee.findById(id).lean();
        if (!legacy) return res.status(404).json({ success: false, message: 'Employee not found' });
        await LegacyEmployee.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Employee removed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const SystemConfig = require('../hr-portal-backend/models/SystemConfig');

const checkAndResetLeaves = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    let config = await SystemConfig.findOne({ configKey: 'main' });
    if (!config) {
        config = new SystemConfig({
            configKey: 'main',
            lastLeaveReset: { month: currentMonth, year: currentYear }
        });
        await config.save();
    }

    const { month: lastMonth, year: lastYear } = config.lastLeaveReset;

    if (currentYear > lastYear || (currentYear === lastYear && currentMonth > lastMonth)) {
        console.log(`Resetting holiday balances via Main Admin for ${currentMonth}/${currentYear}`);
        await LegacyEmployee.updateMany({}, { $set: { holidaysLeft: 2 } });
        config.lastLeaveReset = { month: currentMonth, year: currentYear };
        await config.save();
    }
};

exports.getLeaveApprovals = async (req, res) => {
    try {
        await checkAndResetLeaves();

        const leaves = await Leave.find().sort({ createdAt: -1 }).lean();
        const employeeIds = [...new Set(leaves.map((l) => String(l.employee)).filter(Boolean))];
        const employees = await LegacyEmployee.find({ _id: { $in: employeeIds } })
            .select('_id name holidaysLeft')
            .lean();
        const employeeMap = new Map(employees.map((e) => [String(e._id), e]));

        const formatted = leaves.map(l => ({
            id: l._id,
            employeeName: employeeMap.get(String(l.employee))?.name || 'Unknown',
            type: l.type,
            startDate: l.startDate.toISOString().split('T')[0],
            endDate: l.endDate.toISOString().split('T')[0],
            status: l.status,
            reason: l.reason,
            holidaysLeft: employeeMap.get(String(l.employee))?.holidaysLeft ?? 2,
        }));
        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const normalizedStatus = status === 'Declined' ? 'Rejected' : status;

        const leave = await Leave.findById(id);
        if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

        const oldStatus = leave.status;
        leave.status = normalizedStatus;
        leave.approvedBy = req.user.id;
        await leave.save();

        if (normalizedStatus === 'Approved' && oldStatus !== 'Approved') {
            await LegacyEmployee.findByIdAndUpdate(leave.employee, { $inc: { holidaysLeft: -1 } });
            console.log(`Decremented holiday balance for employee ${leave.employee} in main admin`);
        } else if (oldStatus === 'Approved' && normalizedStatus !== 'Approved') {
            await LegacyEmployee.findByIdAndUpdate(leave.employee, { $inc: { holidaysLeft: 1 } });
            console.log(`Restored holiday balance for employee ${leave.employee} in main admin`);
        }

        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAttendanceLogs = async (req, res) => {
    try {
        const { date } = req.query;
        let queryDate = new Date();
        if (date) {
            queryDate = new Date(date);
        }
        queryDate.setHours(0, 0, 0, 0);

        const logs = await Attendance.find({ date: queryDate }).populate('employee', 'name');

        const formatted = logs.map(l => ({
            id: l._id,
            employeeName: l.employee ? l.employee.name : 'Unknown',
            checkIn: l.checkInTime ? l.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            checkOut: l.checkOutTime ? l.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
            status: l.status,
            device: l.deviceInfo || '-',
            ip: l.ipAddress || '-'
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Allows hr to change status
        const att = await Attendance.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: att });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getEodReports = async (req, res) => {
    try {
        const { date } = req.query;
        let queryDate = new Date();
        if (date) {
            queryDate = new Date(date);
        }
        queryDate.setHours(0, 0, 0, 0);

        const logs = await Attendance.find({ date: queryDate, eodReport: { $exists: true, $ne: '' } }).populate('employee', 'name department');

        const formatted = logs.map(l => ({
            id: l._id,
            employeeName: l.employee ? l.employee.name : 'Unknown',
            department: l.employee?.department || 'General',
            submissionTime: l.checkOutTime ? l.checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            reportText: l.eodReport
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
