const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teamlead').then(async () => {
  const Employee = require('./src/hr-portal-backend/models/Employee.js');
  const Leave = require('./src/models/Leave.js');
  const Attendance = require('./src/models/Attendance.js');

  const startOfMonth = new Date(Date.UTC(2026, 2, 1));
  const endOfMonth = new Date(Date.UTC(2026, 3, 0));

  console.log('Fetching employees...');
  const emps = await Employee.find();

  for (let emp of emps) {
    const leaves = await Leave.countDocuments({
      employee: emp._id,
      status: 'Approved',
      startDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const atts = await Attendance.find({
      employeeId: emp._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: { $in: ['Holiday', 'Half Day'] }
    });

    let attDed = 0;
    for (let a of atts) {
      if (a.status === 'Holiday') attDed += 1;
      else if (a.status === 'Half Day') attDed += 0.5;
    }

    const correctBal = 2 - leaves - attDed;
    console.log(`${emp.email} has Balance: ${correctBal} (Leaves: ${leaves}, Att: ${attDed})`);
    
    emp.holidaysLeft = correctBal;
    await emp.save();
  }

  console.log('Done.');
  process.exit(0);
}).catch(console.error);
