const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const announcementController = require('../controllers/announcementController');

// Employee-accessible: active & non-expired announcements
router.get('/active', protect, announcementController.getActiveAnnouncements);

// Employee announcements endpoint (mounted separately in index.js under /api/employee)
// This route is also exported so it can be directly mounted

// Protected HR/Admin only routes
router.use(protect);
router.use(authorize('admin', 'hr', 'team_lead'));

router.route('/')
    .get(announcementController.getAllAnnouncements)
    .post(announcementController.createAnnouncement);

router.route('/:id')
    .put(announcementController.updateAnnouncement)
    .delete(announcementController.deleteAnnouncement);

module.exports = router;
