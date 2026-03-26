const express = require('express');
const router = express.Router();
const {
    getLeadInflow,
    getSourceDistribution,
    getConversionMetrics,
    getTeamPerformance,
    getHrAnalytics,
    getRankings
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Analytics routes - Admin and Team Lead access
router.get('/leads/inflow', authorize('admin', 'team_lead'), getLeadInflow);
router.get('/leads/sources', authorize('admin', 'team_lead'), getSourceDistribution);
router.get('/leads/conversion', authorize('admin', 'team_lead'), getConversionMetrics);
router.get('/performance/team', authorize('admin', 'team_lead'), getTeamPerformance);

// HR-specific analytics — accessible to admin and hr roles
router.get('/hr', authorize('admin', 'hr'), getHrAnalytics);

// Rankings — accessible to all authenticated users
router.get('/rankings', getRankings);

module.exports = router;
