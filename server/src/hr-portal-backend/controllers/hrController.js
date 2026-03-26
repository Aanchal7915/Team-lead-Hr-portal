const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const SalaryRecord = require('../models/SalaryRecord');
const SystemConfig = require('../models/SystemConfig');
const Announcement = require('../models/Announcement');
const LoginRecord = require('../models/LoginRecord');
const Leave = require('../../models/Leave'); // Shared Leave model (stores LegacyEmployee ids for HR flows)
const LeaveRequest = require('../models/LeaveRequest'); // Legacy leave model kept for reference
const Penalty = require('../models/Penalty');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');



exports.getAllEmployees = async (req, res) => {
    try {
        await checkAndResetLeaves();

        // Ensure logged-in admin/hr also exists in LegacyEmployee so
        // hr/profile and hr-admin/employees always refer to the same dataset.
        if (req.user?.email) {
            const existingById = await Employee.findById(req.user.id).select('_id');
            if (!existingById) {
                await Employee.findOneAndUpdate(
                    { email: req.user.email },
                    {
                        $setOnInsert: {
                            name: req.user.name || 'Employee',
                            email: req.user.email,
                            password: crypto.randomBytes(16).toString('hex'),
                            department: req.user.role === 'hr' ? 'HR' : 'General',
                            phone: req.user.phone || '',
                            address: req.user.address || ''
                        }
                    },
                    { upsert: true, new: false }
                );
            }
        }

        const employees = await Employee.find({}).select('-password');
        res.json(employees);
    } catch (error) {
        console.error("Error in getAllEmployees:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
// @desc    Get a single employee's data by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id).select('-password');
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateEmployeeByHR = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            employee.name = req.body.name || employee.name;
            employee.email = req.body.email || employee.email;
            employee.phone = req.body.phone || employee.phone;
            employee.address = req.body.address || employee.address;
            employee.department = req.body.department || employee.department;
            employee.dob = req.body.dob || employee.dob;
            employee.holidaysLeft = req.body.holidaysLeft ?? employee.holidaysLeft;
            // New fields for HR to set
            employee.salary = req.body.salary || employee.salary;
            employee.joiningDate = req.body.joiningDate || employee.joiningDate;

            const updatedEmployee = await employee.save();
            res.json(updatedEmployee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Delete an employee
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee) {
            await employee.deleteOne();
            // Also remove their attendance records
            await Attendance.deleteMany({ employeeId: req.params.id });
            res.json({ message: 'Employee removed' });
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get attendance records for all employees
exports.getAttendanceForAll = async (req, res) => {
    try {
        // --- FIX: Populate all necessary fields for the HR view ---
        const attendance = await Attendance.find({})
            .populate('employeeId', 'name department employeeId') // <-- This now includes department and employeeId
            .sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update an attendance record


exports.updateAttendanceByHR = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const employee = await Employee.findById(attendance.employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Associated employee not found' });
        }

        const oldStatus = attendance.status;
        const newStatus = req.body.status;

        // Leave deduction logic
        if (oldStatus !== newStatus) {
            let leaveReverted = 0;
            if (oldStatus === 'Holiday') leaveReverted = 1;
            if (oldStatus === 'Half Day') leaveReverted = 0.5;

            let newLeaveCost = 0;
            if (newStatus === 'Holiday') newLeaveCost = 1;
            if (newStatus === 'Half Day') newLeaveCost = 0.5;

            employee.holidaysLeft = employee.holidaysLeft + leaveReverted - newLeaveCost;
            await employee.save();
        }

        // Update the attendance record
        attendance.status = newStatus || attendance.status;
        // Allow setting notes to an empty string by checking if the property exists
        if (req.body.hasOwnProperty('notes')) {
            attendance.notes = req.body.notes;
        }

        // --- FINAL TIMEZONE FIX ---
        // This is the most robust way to handle the date strings from the frontend.
        // It accepts valid ISO strings and handles null/empty values gracefully.
        if (req.body.hasOwnProperty('checkIn')) {
            attendance.checkIn = req.body.checkIn ? new Date(req.body.checkIn) : null;
        }
        if (req.body.hasOwnProperty('checkOut')) {
            attendance.checkOut = req.body.checkOut ? new Date(req.body.checkOut) : null;
        }
        // --- END OF FIX ---

        const updatedAttendance = await attendance.save();
        res.json(updatedAttendance);

    } catch (error) {
        console.error("Error updating attendance:", error); // Added for better server-side logging
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getEodReports = async (req, res) => {
    const { date } = req.query; // Expects a date string like 'YYYY-MM-DD'

    // Determine the target date for checking non-submissions
    let targetDate;
    if (date) {
        // Create a date object from the query string in UTC to avoid timezone issues
        const [year, month, day] = date.split('-').map(Number);
        targetDate = new Date(Date.UTC(year, month - 1, day));
    } else {
        // Default to today (UTC) if no date is provided
        const now = new Date();
        targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    try {
        // Fetch all EOD reports that have been submitted, regardless of date
        const reports = await Attendance.find({ eod: { $exists: true, $ne: null, $ne: "" } })
            .populate('employeeId', 'name department employeeId')
            .sort({ date: -1 });

        // Find attendance records for employees who were present on the target date
        const presentRecordsOnTargetDate = await Attendance.find({
            date: targetDate,
            status: { $in: ['Present', 'Half Day'] }
        });

        // Create a set of IDs for employees who submitted an EOD on the target date
        const submittedEodIds = new Set(presentRecordsOnTargetDate.filter(p => p.eod).map(p => p.employeeId.toString()));

        // Create a set of IDs for all employees who were present on the target date
        const presentEmployeeIds = new Set(presentRecordsOnTargetDate.map(p => p.employeeId.toString()));

        // Find employees who were present but did not submit an EOD
        const allEmployees = await Employee.find({});
        const notSubmittedList = allEmployees.filter(emp =>
            presentEmployeeIds.has(emp._id.toString()) && !submittedEodIds.has(emp._id.toString())
        );

        res.json({ reports, notSubmittedList });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.saveSalaryRecord = async (req, res) => {
    const { month, year, notes, payrollData } = req.body;
    try {
        const newRecord = new SalaryRecord({ month, year, notes, payrollData });
        await newRecord.save();
        res.status(201).json(newRecord);
    } catch (error) {
        console.error("Error saving salary record:", error); // Added for better logging
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all saved salary records
exports.getSalaryRecords = async (req, res) => {
    try {
        const records = await SalaryRecord.find().sort({ year: -1, month: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.updateSalaryRecord = async (req, res) => {
    const { notes } = req.body;
    try {
        const record = await SalaryRecord.findById(req.params.id);
        if (record) {
            record.notes = notes;
            const updatedRecord = await record.save();
            res.json(updatedRecord);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
exports.resetAllLeaves = async (req, res) => {
    try {
        // This powerful command finds all documents ({}) and sets the holidaysLeft field to 2.
        await Employee.updateMany({}, { $set: { holidaysLeft: 2 } });
        res.status(200).json({ message: 'Leave balances for all employees have been reset to 2.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

const checkAndResetLeaves = async () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    let config = await SystemConfig.findOne({ configKey: 'main' });

    // --- FIX: This now correctly uses 'new SystemConfig' ---
    // It will create the record only if it doesn't exist.
    if (!config) {
        console.log("No system config found. Creating a new one.");
        config = new SystemConfig({
            configKey: 'main',
            lastLeaveReset: { month: 0, year: 0 } // Initialize with a past date
        });
        await config.save();
        console.log("New system config created and saved.");
    }

    const { month: lastMonth, year: lastYear } = config.lastLeaveReset;

    // Check if the current date is in a month after the last reset
    if (currentYear > lastYear || (currentYear === lastYear && currentMonth > lastMonth)) {
        console.log(`New month detected. Resetting leave balances for ${currentMonth}/${currentYear}...`);

        await Employee.updateMany({}, { $set: { holidaysLeft: 2 } });

        config.lastLeaveReset = { month: currentMonth, year: currentYear };
        await config.save();

        console.log("Leave balances have been successfully reset.");
    }
};

exports.createAnnouncement = async (req, res) => {
    const { title, content } = req.body;
    try {
        const announcement = new Announcement({
            title,
            content,
            createdBy: req.user.id, // The logged-in HR user
        });
        await announcement.save();

        // Respond immediately to the HR user
        res.status(201).json(announcement);

        // Send emails in the background (no await here)
        (async () => {
            try {
                const employees = await Employee.find({ status: 'Active' }).select('email');
                const emails = employees.map(emp => emp.email).filter(email => email);

                if (emails.length > 0) {
                    await sendEmail({
                        to: emails, // SendGrid can take an array of emails
                        subject: `📢 New Announcement: ${title}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; color: #433020; background-color: #fffbf5;">
                                <h2 style="color: #8a6144; border-bottom: 2px solid #8a6144; padding-bottom: 10px;">New Announcement from AVANI ENTERPRISES</h2>
                                <h3 style="margin-top: 20px;">${title}</h3>
                                <p style="line-height: 1.6;">${content}</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 0.8em; color: #8a6144;">This is an automated notification from the HR Portal. Please log in to view full details.</p>
                            </div>
                        `,
                    });
                }
            } catch (emailError) {
                console.error("Failed to send announcement emails in background:", emailError);
            }
        })();

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error: ' + error.message });
        }
    }
};

// @desc    Get all announcements (for HR view)
exports.getAllAnnouncements = async (req, res) => {
    try {
        console.log("Fetching announcements...");
        const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
        console.log("Announcements fetched successfully");
        res.json(announcements);
    } catch (error) {
        console.log("Error fetching announcements:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getAnalyticsData = async (req, res) => {
    try {
        const employees = await Employee.find({});
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

        const monthlyAttendance = await Attendance.find({
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // 1. Calculate Attendance Trends
        const attendanceTrends = [];
        for (let i = 1; i <= now.getDate(); i++) {
            const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), i));
            const dayString = day.toISOString().split('T')[0];

            const recordsForDay = monthlyAttendance.filter(a => a.date.toISOString().startsWith(dayString));

            attendanceTrends.push({
                name: `${day.toLocaleString('default', { month: 'short' })} ${i}`,
                Present: recordsForDay.filter(r => r.status === 'Present').length,
                'Half Day': recordsForDay.filter(r => r.status === 'Half Day').length,
                Holiday: recordsForDay.filter(r => r.status === 'Holiday').length,
            });
        }

        // 2. Calculate Average Sign-in Time
        let totalMinutes = 0;
        let checkInCount = 0;
        const baseTime = 9 * 60; // 9:00 AM in minutes

        monthlyAttendance.forEach(att => {
            if (att.checkIn) {
                const checkInTime = new Date(att.checkIn);
                let checkInMinutes = checkInTime.getUTCHours() * 60 + checkInTime.getUTCMinutes();
                // If login is before 9 AM, count it as 9 AM
                if (checkInMinutes < baseTime) {
                    checkInMinutes = baseTime;
                }
                totalMinutes += checkInMinutes;
                checkInCount++;
            }
        });

        let averageSignInTime = "N/A";
        if (checkInCount > 0) {
            const avgMinutes = totalMinutes / checkInCount;
            const hours = Math.floor(avgMinutes / 60);
            const minutes = Math.round(avgMinutes % 60);
            averageSignInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        // 3. Calculate Total Paid Leaves Left
        const totalLeavesLeft = employees.reduce((acc, emp) => acc + (emp.holidaysLeft > 0 ? emp.holidaysLeft : 0), 0);

        res.json({
            attendanceTrends,
            averageSignInTime,
            totalLeavesLeft,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};



exports.getEmployeeAnalytics = async (req, res) => {
    const { employeeId } = req.params;
    const { month, year } = req.query; // e.g., month=7, year=2025

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    try {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const monthlyAttendance = await Attendance.find({
            employeeId: employeeId,
            date: { $gte: startDate, $lte: endDate }
        });

        let totalMinutes = 0;
        let checkInCount = 0;
        let lateSignIns = 0;
        const baseTime = 9 * 60; // 9:00 AM in minutes

        const signInTrend = [];

        monthlyAttendance.forEach(att => {
            if (att.checkIn) {
                const checkInTime = new Date(att.checkIn);
                const checkInMinutes = checkInTime.getUTCHours() * 60 + checkInTime.getUTCMinutes();

                totalMinutes += checkInMinutes;
                checkInCount++;

                if (checkInMinutes > baseTime) {
                    lateSignIns++;
                }

                signInTrend.push({
                    day: new Date(att.date).getUTCDate(),
                    signInTime: parseFloat((checkInMinutes / 60).toFixed(2)) // Time in hours (e.g., 9.5 for 9:30)
                });
            }
        });

        let averageSignInTime = "N/A";
        if (checkInCount > 0) {
            const avgMinutes = totalMinutes / checkInCount;
            const hours = Math.floor(avgMinutes / 60);
            const minutes = Math.round(avgMinutes % 60);
            averageSignInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        const unpaidLeaves = employee.holidaysLeft < 0 ? Math.abs(employee.holidaysLeft) : 0;

        res.json({
            averageSignInTime,
            lateSignIns,
            unpaidLeaves,
            signInTrend,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};




exports.getConsolidatedAnalytics = async (req, res) => {
    const { month, year } = req.query;
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    const daysInMonth = endDate.getUTCDate();

    try {
        const employees = await Employee.find({});
        const monthlyAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        }).populate('employeeId');

        const IST_OFFSET_MS = 330 * 60 * 1000;
        const LATE_THRESHOLD_MINUTES = 555; // 9:31 AM

        const totalLateSignIns = monthlyAttendance.filter(att => {
            if (!att.checkIn) return false;
            const checkInIST = new Date(new Date(att.checkIn).getTime() + IST_OFFSET_MS);
            const checkInMinutes = checkInIST.getUTCHours() * 60 + checkInIST.getUTCMinutes();
            return checkInMinutes > LATE_THRESHOLD_MINUTES;
        }).length;

        const totalUnpaidLeaves = employees.reduce((acc, emp) => acc + (emp.holidaysLeft < 0 ? Math.abs(emp.holidaysLeft) : 0), 0);

        const dailyTrends = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dayString = new Date(Date.UTC(year, month - 1, i)).toISOString().split('T')[0];
            const recordsForDay = monthlyAttendance.filter(a => a.date.toISOString().startsWith(dayString));

            const totalSignIns = recordsForDay.filter(r => r.checkIn).length;
            const timelySignIns = recordsForDay.filter(r => {
                if (!r.checkIn) return false;
                const checkInIST = new Date(new Date(r.checkIn).getTime() + IST_OFFSET_MS);
                const checkInMinutes = checkInIST.getUTCHours() * 60 + checkInIST.getUTCMinutes();
                return checkInMinutes <= LATE_THRESHOLD_MINUTES;
            }).length;

            const totalPresent = recordsForDay.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
            const eodSubmissions = recordsForDay.filter(r => r.eod).length;

            dailyTrends.push({
                name: `${i}`,
                timelySignInPercentage: totalSignIns > 0 ? Math.round((timelySignIns / totalSignIns) * 100) : 0,
                eodSubmissionPercentage: totalPresent > 0 ? Math.round((eodSubmissions / totalPresent) * 100) : 0,
            });
        }

        const consolidatedData = employees.map(emp => {
            const empAttendance = monthlyAttendance.filter(att => att.employeeId && att.employeeId._id.toString() === emp._id.toString());

            const lateSignInsList = empAttendance.filter(att => {
                if (!att.checkIn) return false;
                const checkInIST = new Date(new Date(att.checkIn).getTime() + IST_OFFSET_MS);
                const checkInMinutes = checkInIST.getUTCHours() * 60 + checkInIST.getUTCMinutes();
                return checkInMinutes > LATE_THRESHOLD_MINUTES;
            });
            const lateSignIns = lateSignInsList.length;
            const totalSignIns = empAttendance.filter(att => att.checkIn).length;

            const totalPresentDays = empAttendance.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
            const eodSubmissions = empAttendance.filter(r => r.eod).length;

            return {
                id: emp.employeeId,
                name: emp.name,
                department: emp.department,
                unpaidLeaves: emp.holidaysLeft < 0 ? Math.abs(emp.holidaysLeft) : 0,
                lateSignIns,
                lateSignInPercentage: totalSignIns > 0 ? `${Math.round((lateSignIns / totalSignIns) * 100)}%` : 'N/A',
                eodCompliance: totalPresentDays > 0 ? `${Math.round((eodSubmissions / totalPresentDays) * 100)}%` : 'N/A',
            };
        });

        res.json({
            totalLateSignIns,
            totalUnpaidLeaves,
            dailyTrends,
            consolidatedData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getLoginData = async (req, res) => {
    try {
        const loginRecords = await LoginRecord.find()
            .populate('employeeId', 'name employeeId department')
            .sort({ createdAt: -1 });
        res.json(loginRecords);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.getPendingLeaves = async (req, res) => {
    try {
        // Auto-reset leave balances at the start of each new month
        await checkAndResetLeaves();

        const pendingLeaves = await Leave.find({ status: 'Pending' })
            .sort({ createdAt: 1 })
            .lean();
        const employeeIds = [...new Set(pendingLeaves.map((l) => String(l.employee)).filter(Boolean))];
        const employees = await Employee.find({ _id: { $in: employeeIds } })
            .select('_id name department employeeId holidaysLeft')
            .lean();
        const employeeMap = new Map(employees.map((e) => [String(e._id), e]));

        // Reshape to match the frontend (ApproveLeavePage.jsx) expectations
        const shaped = pendingLeaves.map(l => ({
            _id: l._id,
            employeeId: {
                _id: l.employee,
                name: employeeMap.get(String(l.employee))?.name || 'Unknown',
                department: employeeMap.get(String(l.employee))?.department || 'N/A',
                employeeId: employeeMap.get(String(l.employee))?.employeeId || '',
                holidaysLeft: employeeMap.get(String(l.employee))?.holidaysLeft ?? 2,
            },
            leaveDate: l.startDate,
            reason: l.reason,
            status: l.status,
            createdAt: l.createdAt,
        }));
        res.json(shaped);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update the status of a leave request
exports.updateLeaveStatus = async (req, res) => {
    const { status } = req.body; // Expecting 'Approved' or 'Declined'
    try {
        // Map 'Declined' -> 'Rejected' to fit the unified Leave model enum
        const normalizedStatus = status === 'Declined' ? 'Rejected' : status;

        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        const oldStatus = leave.status; // capture before changing

        leave.status = normalizedStatus;
        leave.approvedBy = req.user.id;
        await leave.save();

        // --- Holiday Balance Logic (mirrors updateAttendanceByHR) ---
        // Each approved leave costs 1 holiday. If reversed, restore 1.
        if (normalizedStatus === 'Approved' && oldStatus !== 'Approved') {
            await Employee.findByIdAndUpdate(leave.employee, { $inc: { holidaysLeft: -1 } });
            console.log(`Decremented holiday balance for employee ${leave.employee}`);
        } else if (oldStatus === 'Approved' && normalizedStatus !== 'Approved') {
            await Employee.findByIdAndUpdate(leave.employee, { $inc: { holidaysLeft: 1 } });
            console.log(`Restored holiday balance for employee ${leave.employee}`);
        }

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};



exports.calculatePayroll = async (req, res) => {
    const { month, year } = req.query; // e.g., month=8, year=2025

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    try {
        const employees = await Employee.find({});
        const monthlyAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        });

        const payrollData = employees.map(emp => {
            const dailySalary = emp.salary > 0 ? emp.salary / 30 : 0;
            const empAttendance = monthlyAttendance.filter(a => a.employeeId.toString() === emp._id.toString());

            let lateDeductions = 0;
            let noEodDeductions = 0;
            const deductionLog = []; // New log for each employee
            const IST_OFFSET_MS = 330 * 60 * 1000; // 5.5 hours for IST

            empAttendance.forEach(att => {
                const eventDate = new Date(att.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

                // Rule 1: Late Sign-in Deductions
                if (att.checkIn) {
                    const checkInUTC = new Date(att.checkIn);
                    const checkInIST = new Date(checkInUTC.getTime() + IST_OFFSET_MS);
                    const checkInMinutes = checkInIST.getUTCHours() * 60 + checkInIST.getUTCMinutes();

                    let lateFine = 0;
                    if (checkInMinutes >= 556 && checkInMinutes <= 615) lateFine = 100;      // 9:16 - 10:15
                    else if (checkInMinutes > 615 && checkInMinutes <= 675) lateFine = 200; // 10:16 - 11:15
                    else if (checkInMinutes > 675 && checkInMinutes <= 720) lateFine = 300; // 11:16 - 12:00
                    else if (checkInMinutes > 720) lateFine = (dailySalary / 2);              // After 12:00 PM

                    if (lateFine > 0) {
                        lateDeductions += lateFine;
                        deductionLog.push({ date: eventDate, reason: 'Late Sign-in', amount: Math.round(lateFine) });
                    }
                }

                // Rule 2: No EOD / No Checkout Deductions
                if ((att.status === 'Present' || att.status === 'Half Day')) {
                    if (att.checkOut && !att.eod) {
                        const checkOutUTC = new Date(att.checkOut);
                        const checkOutIST = new Date(checkOutUTC.getTime() + IST_OFFSET_MS);
                        const checkOutHour = checkOutIST.getUTCHours();
                        if (checkOutHour >= 21) {
                            const fine = dailySalary * 0.70;
                            noEodDeductions += fine;
                            deductionLog.push({ date: eventDate, reason: 'No EOD (after 9 PM)', amount: Math.round(fine) });
                        }
                    } else if (!att.checkOut) {
                        noEodDeductions += dailySalary;
                        deductionLog.push({ date: eventDate, reason: 'No Checkout', amount: Math.round(dailySalary) });
                    }
                }
            });

            const unpaidLeaves = emp.holidaysLeft < 0 ? Math.abs(emp.holidaysLeft) : 0;
            const unpaidLeaveDeductions = unpaidLeaves * dailySalary;
            if (unpaidLeaves > 0) {
                deductionLog.push({ date: 'Month Total', reason: `${unpaidLeaves} Unpaid Leave(s)`, amount: Math.round(unpaidLeaveDeductions) });
            }

            const totalDeductions = unpaidLeaveDeductions + lateDeductions + noEodDeductions;
            const netSalary = emp.salary - totalDeductions;

            return {
                employeeId: emp._id,
                employeeName: emp.name,
                baseSalary: emp.salary,
                unpaidLeaves,
                lateDeductions: Math.round(lateDeductions),
                noEodDeductions: Math.round(noEodDeductions),
                totalDeductions: Math.round(totalDeductions),
                netSalary: Math.round(netSalary),
                deductionLog, // Include the detailed log in the response
            };
        });

        res.json(payrollData);

    } catch (error) {
        console.error("Error calculating payroll:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};
exports.getEmployeeRankings = async (req, res) => {
    try {
        // --- FIX 1: Use the month and year from the request query ---
        const { month, year } = req.query;

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0));

        const employees = await Employee.find({}).select('name employeeId');
        const monthlyAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        });

        const employeeStats = employees.map(emp => {
            const empAttendance = monthlyAttendance.filter(a => a.employeeId.toString() === emp._id.toString());

            const totalSignIns = empAttendance.filter(att => att.checkIn).length;

            const IST_OFFSET_MS = 330 * 60 * 1000;
            const LATE_THRESHOLD_MINUTES = 555; // 9:15 AM

            const lateSignIns = empAttendance.filter(att => {
                if (!att.checkIn) return false;
                const checkInUTC = new Date(att.checkIn);
                const checkInIST = new Date(checkInUTC.getTime() + IST_OFFSET_MS);
                const checkInMinutes = checkInIST.getUTCHours() * 60 + checkInIST.getUTCMinutes();
                return checkInMinutes > LATE_THRESHOLD_MINUTES;
            }).length;

            const totalPresentDays = empAttendance.filter(r => r.status === 'Present' || r.status === 'Half Day').length;
            const eodSubmissions = empAttendance.filter(r => r.eod).length;

            return {
                _id: emp._id,
                name: emp.name,
                employeeId: emp.employeeId,
                timelySignInPercentage: totalSignIns > 0 ? Math.round(((totalSignIns - lateSignIns) / totalSignIns) * 100) : 0,
                eodSubmissionPercentage: totalPresentDays > 0 ? Math.round((eodSubmissions / totalPresentDays) * 100) : 0,
            };
        });

        // --- FIX 2: Corrected logic for handling ties ---
        const assignRanks = (stats, key) => {
            const sorted = [...stats].sort((a, b) => b[key] - a[key]);
            let rank = 1;
            for (let i = 0; i < sorted.length; i++) {
                // If not the first person and their score is lower than the person before them, update the rank
                if (i > 0 && sorted[i][key] < sorted[i - 1][key]) {
                    rank = i + 1;
                }
                sorted[i][`${key}Rank`] = rank;
            }
            return sorted;
        };

        const timelySignInRankings = assignRanks(employeeStats, 'timelySignInPercentage');
        const eodSubmissionRankings = assignRanks(employeeStats, 'eodSubmissionPercentage');

        res.json({ timelySignInRankings, eodSubmissionRankings });

    } catch (error) {
        console.error("Error in getEmployeeRankings:", error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


// controllers/hrController.js
// exports.getPenalties = async (req, res) => {
//     try {
//         const { month } = req.query;
//         const start = new Date(`${month}-01T00:00:00Z`);
//         const end = new Date(start);
//         end.setMonth(end.getMonth() + 1);

//         const penalties = await LoginRecord.aggregate([
//             {
//                 $match: {
//                     action: { $in: ['Check-in', 'Check-out'] },
//                     isTouchDevice: true,
//                     createdAt: { $gte: start, $lt: end }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { employeeId: "$employeeId" },
//                     penaltyCount: { $sum: 1 },
//                     dates: { $push: { action: "$action", createdAt: "$createdAt", ip: "$ipAddress" } }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "employees",
//                     localField: "_id.employeeId",
//                     foreignField: "_id",
//                     as: "employee"
//                 }
//             },
//             { $unwind: "$employee" },
//             {
//   $project: {
//     employeeId: "$employee.employeeId",
//     name: "$employee.name",
//     department: "$employee.department",
//     penaltyCount: 1,
//     dates: { $ifNull: ["$dates", []] } // ✅ Always return [] if null/undefined
//   }
// }

//         ]);

//         res.json(penalties);
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching penalties: " + err.message });
//     }
// };



// exports.getEmployeePenalties = async (req, res) => {
//   const { employeeId } = req.params;
//   const { month } = req.query; // YYYY-MM
//   try {
//     const penalties = await Penalty.find({
//       employee: employeeId,
//       month,
//     }).populate("employee", "name employeeId");
//     res.json(penalties);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// controllers/penaltyController.js






// Employees that should always show 0 penalties
const EXEMPT_EMPLOYEES = ["AVANI-1003", "AVANI-1007", "AVANI-1022"];


exports.getPenalties = async (req, res) => {
    try {
        const { month } = req.query; // format: YYYY-MM
        const start = new Date(`${month}-01T00:00:00Z`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        let penalties = await Employee.aggregate([
            {
                $lookup: {
                    from: "loginrecords",
                    let: { empId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$employeeId", "$$empId"] },
                                $or: [
                                    { action: "Check-in", isTouchDevice: true },
                                    { action: "Check-out", isTouchDevice: true }
                                ],
                                createdAt: { $gte: start, $lt: end },
                            },
                        },
                        // --- NEW: Group and count penalties to avoid duplicates per day ---
                        {
                            $group: {
                                _id: {
                                    employeeId: "$employeeId",
                                    action: "$action",
                                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                                },
                                latestRecord: { $last: "$$ROOT" }
                            }
                        },
                        {
                            $replaceRoot: { newRoot: "$latestRecord" }
                        },
                        // --- END NEW SECTION ---
                        {
                            $project: {
                                action: 1,
                                createdAt: 1,
                                ipAddress: 1,
                                location: 1,
                                latitude: 1,
                                longitude: 1,
                                deviceModel: 1,
                            },
                        },
                    ],
                    as: "penaltyLogs",
                },
            },
            {
                $addFields: {
                    penaltyCount: {
                        $cond: [
                            { $in: ["$employeeId", EXEMPT_EMPLOYEES] },
                            0,
                            { $size: "$penaltyLogs" },
                        ],
                    },
                    penaltyLogs: {
                        $cond: [
                            { $in: ["$employeeId", EXEMPT_EMPLOYEES] },
                            [],
                            "$penaltyLogs",
                        ],
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    employeeId: 1,
                    name: 1,
                    department: 1,
                    penaltyCount: 1,
                    dates: "$penaltyLogs",
                },
            },
        ]);

        penalties.sort((a, b) => {
            if (a.penaltyCount === 0 && b.penaltyCount > 0) return 1;
            if (a.penaltyCount > 0 && b.penaltyCount === 0) return -1;
            return a.name.localeCompare(b.name);
        });

        res.json(penalties);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching penalties: " + err.message });
    }
};

exports.getEmployeePenalties = async (req, res) => {
    const { employeeId } = req.params;
    const { month } = req.query;
    try {
        if (EXEMPT_EMPLOYEES.includes(employeeId)) {
            return res.json([]);
        }

        const start = new Date(`${month}-01T00:00:00Z`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const employee = await Employee.findOne({ employeeId });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const penalties = await LoginRecord.aggregate([
            {
                $match: {
                    employeeId: employee._id,
                    action: { $in: ["Check-in", "Check-out"] },
                    isTouchDevice: true,
                    createdAt: { $gte: start, $lt: end },
                },
            },
            // --- NEW: Group and count penalties to avoid duplicates per day ---
            {
                $group: {
                    _id: {
                        action: "$action",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                    },
                    latestRecord: { $last: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$latestRecord" }
            },
            // --- END NEW SECTION ---
            {
                $project: {
                    action: 1,
                    createdAt: 1,
                    ipAddress: 1,
                    location: 1,
                    latitude: 1,
                    longitude: 1,
                    deviceModel: 1,
                },
            },
        ]);

        res.json(penalties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



// exports.getPenalties = async (req, res) => {
//     try {
//         const { month } = req.query; // format: YYYY-MM
//         const start = new Date(`${month}-01T00:00:00Z`);
//         const end = new Date(start);
//         end.setMonth(end.getMonth() + 1);

//         let penalties = await Employee.aggregate([
//             {
//                 $lookup: {
//                     from: "loginrecords",
//                     let: { empId: "$_id" }, // ✅ use ObjectId (_id)
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: { $eq: ["$employeeId", "$$empId"] }, // ✅ match ObjectId
//                                 // --- CHANGE: Explicitly filter for touch device check-ins and check-outs ---
//                                 $or: [
//                                     { action: "Check-in", isTouchDevice: true },
//                                     { action: "Check-out", isTouchDevice: true }
//                                 ],
//                                 createdAt: { $gte: start, $lt: end },
//                             },
//                         },
//                         {
//                             $project: {
//                                 action: 1,
//                                 createdAt: 1,
//                                 ipAddress: 1,
//                                 location: 1,
//                                 latitude: 1,
//                                 longitude: 1,
//                                 deviceModel: 1,
//                             },
//                         },
//                     ],
//                     as: "penaltyLogs",
//                 },
//             },
//             {
//                 $addFields: {
//                     penaltyCount: {
//                         $cond: [
//                             { $in: ["$employeeId", EXEMPT_EMPLOYEES] }, // ✅ use string employeeId
//                             0,
//                             { $size: "$penaltyLogs" },
//                         ],
//                     },
//                     // clear logs if exempted
//                     penaltyLogs: {
//                         $cond: [
//                             { $in: ["$employeeId", EXEMPT_EMPLOYEES] },
//                             [],
//                             "$penaltyLogs",
//                         ],
//                     },
//                 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     employeeId: 1, // string code (AVANI-1003)
//                     name: 1,
//                     department: 1,
//                     penaltyCount: 1,
//                     dates: "$penaltyLogs",
//                 },
//             },
//         ]);

//         // sort → penalties > 0 first, then 0, then by name
//         penalties.sort((a, b) => {
//             if (a.penaltyCount === 0 && b.penaltyCount > 0) return 1;
//             if (a.penaltyCount > 0 && b.penaltyCount === 0) return -1;
//             return a.name.localeCompare(b.name);
//         });

//         res.json(penalties);
//     } catch (err) {
//         res
//             .status(500)
//             .json({ message: "Error fetching penalties: " + err.message });
//     }
// };

// // For single employee penalty detail
// exports.getEmployeePenalties = async (req, res) => {
//     const { employeeId } = req.params; // string code
//     const { month } = req.query; // YYYY-MM
//     try {
//         // If employee is exempt → return empty penalties
//         if (EXEMPT_EMPLOYEES.includes(employeeId)) {
//             return res.json([]);
//         }

//         const start = new Date(`${month}-01T00:00:00Z`);
//         const end = new Date(start);
//         end.setMonth(end.getMonth() + 1);

//         const employee = await Employee.findOne({ employeeId });
//         if (!employee) {
//             return res.status(404).json({ message: "Employee not found" });
//         }

//         // --- CHANGE: Explicitly filter for touch device check-ins and check-outs ---
//         const penalties = await LoginRecord.find({
//             employeeId: employee._id,
//             action: { $in: ["Check-in", "Check-out"] },
//             isTouchDevice: true,
//             createdAt: { $gte: start, $lt: end },
//         }).lean();

//         res.json(penalties);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// };
