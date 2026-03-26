// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
    requestRegistrationOtp, // New
    verifyAndRegister, 
    registerHR, // This function is used by the new HR registration route
    loginEmployee,
    loginHR,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

router.post('/register/request-otp', requestRegistrationOtp);
router.post('/register/verify', verifyAndRegister);

// @route   POST api/auth/register/hr
// @desc    Register a new HR user
router.post('/register-hr', registerHR);

// @route   POST api/auth/login/employee
// @desc    Authenticate employee & get token
router.post('/login/employee', loginEmployee);

// @route   POST api/auth/login/hr
// @desc    Authenticate HR & get token
router.post('/login/hr', loginHR);

// @route   POST api/auth/forgotpassword
// @desc    Forgot password
router.post('/forgotpassword', forgotPassword);

// @route   PUT api/auth/resetpassword/:resettoken
// @desc    Reset password
router.put('/resetpassword', resetPassword);

module.exports = router;
