const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const employeehrController = require('../controllers/employeehrController');

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);

router.get('/attendance', employeehrController.getAttendance);
router.post('/attendance/checkin', employeehrController.checkIn);
router.post('/attendance/checkout', employeehrController.checkOut);

router.get('/leaves', employeehrController.getLeaves);
router.post('/leaves', employeehrController.applyLeave);

router.get('/rankings', employeehrController.getRankings);

// Salary slips
router.get('/employee/salary', employeehrController.getSalarySlips);

// Announcements for employees
router.get('/employee/announcements', employeehrController.getEmployeeAnnouncements);

// Profile
router.get('/employee/profile', employeehrController.getProfile);
router.put('/employee/profile', upload.single('avatar'), employeehrController.updateProfile);
router.post('/employee/upload', upload.single('file'), employeehrController.uploadDocument);

module.exports = router;
