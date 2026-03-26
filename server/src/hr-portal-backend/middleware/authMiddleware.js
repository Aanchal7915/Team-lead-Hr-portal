const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const HR = require('../models/HR');

const protect = (userType) => async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            let employee = await Employee.findById(decoded.id).select('-password');
            if (!employee && decoded.email) {
                employee = await Employee.findOne({ email: decoded.email }).select('-password');
            }

            let hr = await HR.findById(decoded.id).select('-password');
            if (!hr && decoded.email) {
                hr = await HR.findOne({ email: decoded.email }).select('-password');
            }

            const roleFromToken = decoded.role;
            let isAllowed = false;

            if (userType === 'employee') {
                isAllowed = Boolean(employee || hr || ['team_member', 'team_lead', 'admin', 'hr'].includes(roleFromToken));
            }

            if (userType === 'hr') {
                isAllowed = Boolean(hr || (employee && employee.department === 'HR') || ['hr', 'admin'].includes(roleFromToken));
            }

            if (!isAllowed) {
                return res.status(403).json({ message: 'Not authorized for this HR role' });
            }

            req.user = employee || hr || {
                id: decoded.id,
                _id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                role: decoded.role,
                phone: decoded.phone,
                address: decoded.address
            };
            return next();
        } catch (error) {
            console.error('Authentication error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

exports.protectEmployee = protect('employee');
exports.protectHR = protect('hr');
