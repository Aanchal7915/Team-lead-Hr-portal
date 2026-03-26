const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const hradController = require('../controllers/hradController');

// Protect and require hr or admin role for all routes in here
router.use(protect);
router.use(authorize('hr', 'admin'));

router.get('/overview', hradController.getOverviewStats);
router.get('/employees', hradController.getEmployees);
router.put('/employees/:id', hradController.updateEmployee);
router.delete('/employees/:id', hradController.deleteEmployee);
router.get('/leaves', hradController.getLeaveApprovals);
router.put('/leaves/:id/status', hradController.updateLeaveStatus);
router.get('/attendance-logs', hradController.getAttendanceLogs);
router.put('/attendance-logs/:id', hradController.updateAttendance);
router.get('/eod-reports', hradController.getEodReports);

module.exports = router;
