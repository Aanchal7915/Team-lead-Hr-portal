const express = require('express');
const router = express.Router();
const {
    getEmployeeProfile,
    updateEmployeeProfile,
    markAttendance,
    getAttendanceHistory,
    getAnnouncementsForEmployee,
    markAnnouncementsAsRead,
    applyForLeave,
    getLeaveHistory, getEmployeeRankings
} = require('../controllers/employeeController');
const {
    getEmployeeSalarySlips,
    getEmployeeSalarySlipById
} = require('../controllers/salarySlipController');
const { protectEmployee } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', protectEmployee, getEmployeeProfile);
router.put('/profile', protectEmployee, updateEmployeeProfile);
router.post('/upload', protectEmployee, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ secure_url: fileUrl });
});
router.post('/attendance', protectEmployee, markAttendance);
router.get('/attendance', protectEmployee, getAttendanceHistory);
router.get('/announcements', protectEmployee, getAnnouncementsForEmployee);
router.post('/announcements/read', protectEmployee, markAnnouncementsAsRead);

router.post('/leave', protectEmployee, applyForLeave);
router.get('/leave/history', protectEmployee, getLeaveHistory)
router.get('/rankings', protectEmployee, getEmployeeRankings);

// Salary Slip Routes
router.get('/salary-slips', protectEmployee, getEmployeeSalarySlips);
router.get('/salary-slips/:id', protectEmployee, getEmployeeSalarySlipById);

module.exports = router;