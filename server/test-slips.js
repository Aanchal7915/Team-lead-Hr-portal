const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
      console.log('Connected to MONGODB_URI.');
      
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));

      // Attempt to load from the Original HR Portal Model
      try {
          const OldSlip = require('./src/models/SalarySlip');
          const oldSlips = await OldSlip.find({}).lean();
          console.log(`Original HR Portal Slips Count: ${oldSlips.length}`);
          if (oldSlips.length > 0) {
              console.log('Collection name for OldSlip:', OldSlip.collection.name);
          }
      } catch (e) {
          console.error('Error loading Old Slip:', e.message);
      }

      // Attempt to load from Unified HR Portal Model
      try {
          const NewSlip = require('./src/hr-portal-backend/models/SalarySlip');
          const newSlips = await NewSlip.find({}).lean();
          console.log(`Unified HR Portal Slips Count: ${newSlips.length}`);
          if (newSlips.length > 0) {
              console.log('Collection name for NewSlip:', NewSlip.collection.name);
          }
      } catch (e) {
          console.error('Error loading New Slip:', e.message);
      }

      mongoose.connection.close();
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
