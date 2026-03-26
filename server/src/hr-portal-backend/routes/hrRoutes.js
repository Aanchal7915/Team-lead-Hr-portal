const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  updateEmployeeByHR,
  deleteEmployee,
  getAttendanceForAll,
  updateAttendanceByHR,
  getEodReports,
  saveSalaryRecord,
  updateSalaryRecord, // <-- 
  getSalaryRecords,
  createAnnouncement,
  getAllAnnouncements,
  // getAnalyticsData ,
  getEmployeeAnalytics,
  getConsolidatedAnalytics,
  getLoginData,
  getPendingLeaves,
  // <-- Import new function
  updateLeaveStatus,
  getPenalties,
  getEmployeePenalties,
  calculatePayroll, getEmployeeRankings
} = require('../controllers/hrController');

const { protectHR } = require('../middleware/authMiddleware');

router.get('/employees', protectHR, getAllEmployees);
router.get('/employees/:id', protectHR, getEmployeeById);
router.put('/employees/:id', protectHR, updateEmployeeByHR);
router.delete('/employees/:id', protectHR, deleteEmployee);
router.get('/attendance', protectHR, getAttendanceForAll);
router.put('/attendance/:id', protectHR, updateAttendanceByHR);
router.get('/eod-reports', protectHR, getEodReports);

router.post('/salary-records', protectHR, saveSalaryRecord);
router.get('/salary-records', protectHR, getSalaryRecords);
router.put('/salary-records/:id', protectHR, updateSalaryRecord);

router.post('/announcements', protectHR, createAnnouncement);
router.get('/announcements', protectHR, getAllAnnouncements);

// router.get('/analytics', protectHR, getAnalyticsData);
router.get('/analytics/consolidated', protectHR, getConsolidatedAnalytics);

// This route is for fetching data for an individual employee
router.get('/analytics/:employeeId', protectHR, getEmployeeAnalytics);

router.get('/getdata', protectHR, getLoginData);

// --- NEW LEAVE MANAGEMENT ROUTES ---
router.get('/leaves/pending', protectHR, getPendingLeaves);
router.put('/leaves/:id/status', protectHR, updateLeaveStatus);
router.get('/payroll', protectHR, calculatePayroll);
router.get('/rankings', protectHR, getEmployeeRankings);


router.get('/penalties', protectHR, getPenalties);
router.get('/penalties/:employeeId', protectHR, getEmployeePenalties);
module.exports = router;