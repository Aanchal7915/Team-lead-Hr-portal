const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { protect, authorize } = require('../middleware/auth');
const salarySlipController = require('../controllers/salarySlipController');

// Multer setup
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, os.tmpdir()),
        filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
    })
});

// Employee: view their own slips
router.get('/mine', protect, salarySlipController.getMySalarySlips);

// HR Admin / Admin only routes
router.use(protect);
router.use(authorize('admin', 'hr'));

router.get('/latest-info', salarySlipController.getLatestCompanyInfo);
router.post('/upload-asset', upload.single('asset'), salarySlipController.uploadSalarySlipAsset);
router.post('/generate', salarySlipController.generateSalarySlips);
router.post('/approve', salarySlipController.approveSalarySlips);

router.get('/', salarySlipController.getAllSalarySlips);
router.get('/:id', salarySlipController.getSalarySlipById || salarySlipController.getAllSalarySlips);
router.put('/:id', salarySlipController.updateSalarySlip);
router.delete('/:id', salarySlipController.deleteSalarySlip);

// For compatibility with any legacy frontend calls
router.post('/', salarySlipController.generateSalarySlips);

module.exports = router;
