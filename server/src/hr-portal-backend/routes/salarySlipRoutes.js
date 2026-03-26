const express = require('express');
const router = express.Router();
const {
    generateSalarySlips,
    getSalarySlips,
    getSalarySlipById,
    updateSalarySlip,
    approveSalarySlips,
    deleteSalarySlip,
    uploadSalarySlipAsset,
    getLatestCompanyInfo
} = require('../controllers/salarySlipController');

const { protectHR } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// HR Routes
router.get('/latest-info', protectHR, getLatestCompanyInfo);
router.post('/upload-asset', protectHR, upload.single('asset'), uploadSalarySlipAsset);

router.post('/generate', protectHR, generateSalarySlips);
router.get('/', protectHR, getSalarySlips);
router.get('/:id', protectHR, getSalarySlipById);
router.put('/:id', protectHR, updateSalarySlip);
router.post('/approve', protectHR, approveSalarySlips);
router.delete('/:id', protectHR, deleteSalarySlip);

module.exports = router;
