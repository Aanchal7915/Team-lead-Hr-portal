const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
      const OldSlip = require('./src/models/SalarySlip');
      const oldSlips = await OldSlip.find({}).lean();
      
      const Employee = require('./src/hr-portal-backend/models/Employee');
      let matchedCount = 0;
      let userCount = 0;
      const User = require('./src/models/User');

      for (let slip of oldSlips) {
          const emp = await Employee.findById(slip.employee);
          if (emp) matchedCount++;

          const user = await User.findById(slip.employee);
          if (user) userCount++;
      }

      console.log(`Matched against Employee model: ${matchedCount} / ${oldSlips.length}`);
      console.log(`Matched against User model: ${userCount} / ${oldSlips.length}`);

      mongoose.connection.close();
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
