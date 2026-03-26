const fs = require('fs');
let code = fs.readFileSync('src/hr-portal-backend/controllers/salarySlipController.js', 'utf8');

code = code.replace(/employeeId: employee\._id/g, 'employee: employee._id');
code = code.replace(/employeeId: employeeId/g, 'employee: employeeId');
code = code.replace(/populate\('employeeId'/g, "populate('employee'");
code = code.replace(/slip\.employeeId \|\|/g, 'slip.employee ||');
code = code.replace(/query\.employeeId = /g, 'query.employee = ');
code = code.replace(/salarySlip\.employeeId/g, 'salarySlip.employee');
code = code.replace(/{ employeeId: employee\._id }/g, '{ employee: employee._id }');
code = code.replace(/employeeId: req\.user\._id/g, 'employee: req.user._id');

fs.writeFileSync('src/hr-portal-backend/controllers/salarySlipController.js', code, 'utf8');
console.log('Fixed auth employee naming successfully!');
