
const Employee = require('../models/Employee');
const HR = require('../models/HR');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); 
const LoginRecord = require('../models/LoginRecord'); 



exports.registerHR = async (req, res) => {
    console.log('✅ registerHR controller hit'); // Add this line

    const { name, email, password } = req.body;
    console.log('Request Body:', req.body); // Log incoming data

    try {
        const hrExists = await HR.findOne({ email });
        if (hrExists) {
            console.log('❌ HR already exists with email:', email);
            return res.status(400).json({ message: 'HR user with this email already exists' });
        }

        const hr = await HR.create({ name, email, password });
        console.log('✅ HR created:', hr);

        if (hr) {
            res.status(201).json({
                _id: hr._id,
                name: hr.name,
                email: hr.email,
                role: 'hr',
                token: generateToken(hr._id, 'hr'),
            });
        } else {
            console.log('❌ Invalid HR data');
            res.status(400).json({ message: 'Invalid HR data provided' });
        }
    } catch (error) {
        console.error('❌ Error in registerHR:', error.message);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


// @desc    Authenticate HR & get token
exports.loginHR = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hr = await HR.findOne({ email });
        if (hr && (await hr.matchPassword(password))) {
            res.json({
                _id: hr._id,
                name: hr.name,
                email: hr.email,
                role: 'hr',
                token: generateToken(hr._id, 'hr'),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


exports.requestRegistrationOtp = async (req, res) => {
    const { name, email, password, department, phone, address, dob } = req.body;

    try {
        let employee = await Employee.findOne({ email });

        if (employee && employee.isVerified) {
            return res.status(400).json({ message: 'An active account with this email already exists.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (employee && !employee.isVerified) {
            // Update existing unverified user
            Object.assign(employee, { name, password, department, phone, address, dob, otp, otpExpires });
            await employee.save();
        } else {
            // Create a new, unverified employee record
            employee = await Employee.create({ name, email, password, department, phone, address, dob, otp, otpExpires });
        }

        // --- CHANGE: Send the OTP email ONLY to the HR admins ---
        const hrApprovalMessage = `
            <p>A new employee has requested to join the AVANI ENTERPRISES portal.</p>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p>Please provide them with the following One-Time Password (OTP) to complete their registration:</p>
            <h2 style="font-size: 24px; letter-spacing: 2px;"><b>${otp}</b></h2>
            <p>This OTP is valid for 10 minutes.</p>
        `;
        const adminEmails = [process.env.ADMIN_EMAIL_1, process.env.ADMIN_EMAIL_2].filter(Boolean);
        await sendEmail({
            to: adminEmails,
            subject: `New Employee Registration Request: ${name}`,
            html: hrApprovalMessage,
        });

        res.status(200).json({ message: 'Registration request sent. Please contact HR for your verification OTP.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Step 2: Verify OTP and finalize registration
exports.verifyAndRegister = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const employee = await Employee.findOne({ email, otp, otpExpires: { $gt: Date.now() } });

        if (!employee) {
            return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
        }

        employee.isVerified = true;
        employee.otp = undefined;
        employee.otpExpires = undefined;
        await employee.save();

        res.status(201).json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            token: generateToken(employee._id, 'employee'),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};


// --- FORGOT PASSWORD FLOW (UPDATED) ---

// @desc    Step 1: Send Password Reset OTP to the employee only
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const employee = await Employee.findOne({ email, isVerified: true });
        if (!employee) {
            return res.status(404).json({ message: "No active employee found with that email." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        employee.otp = otp;
        employee.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await employee.save();
        
        const message = `<p>You requested a password reset. Your One-Time Password (OTP) is:</p>
                         <h2 style="font-size: 24px; letter-spacing: 2px;"><b>${otp}</b></h2>
                         <p>This OTP is valid for 10 minutes.</p>`;
        
        // --- CHANGE: Send email ONLY to the employee who requested it ---
        await sendEmail({
            to: employee.email,
            subject: 'Your Password Reset OTP for AVANI ENTERPRISES',
            html: message,
        });

        res.status(200).json({ message: 'Password reset OTP sent to your email.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Step 2: Reset Password with OTP
exports.resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const employee = await Employee.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!employee) {
            return res.status(400).json({ message: "Invalid OTP or OTP has expired." });
        }

        employee.password = password;
        employee.otp = undefined;
        employee.otpExpires = undefined;
        await employee.save();

        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

exports.loginEmployee = async (req, res) => {
    // --- UPDATED: Now accepts isTouchDevice ---
    const { email, password, deviceInfo, isTouchDevice } = req.body;

    try {
        const employee = await Employee.findOne({ email, isVerified: true });

        if (employee && (await employee.matchPassword(password))) {
            const ipAddress = req.ip || req.connection.remoteAddress;
            const newLoginRecord = new LoginRecord({
                employeeId: employee._id,
                action: 'Login',
                deviceInfo: deviceInfo || 'Unknown device',
                ipAddress: ipAddress,
                isTouchDevice: isTouchDevice || false, // Save the touch status
            });
            await newLoginRecord.save();
            
            res.json({  _id: employee._id,
                name: employee.name,
                email: employee.email,
                role: 'employee',
                token: generateToken(employee._id, 'employee'), });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

