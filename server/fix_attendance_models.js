const mongoose = require('mongoose');
const Attendance = require('./src/hr-portal-backend/models/Attendance');
require('dotenv').config();

const fixAttendance = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/teamlead");
        console.log("Connected to DB");
        
        const result = await Attendance.updateMany(
            { onModel: { $exists: false } },
            { $set: { onModel: 'LegacyEmployee' } }
        );
        
        console.log(`Updated ${result.nModified || result.modifiedCount} records with onModel='LegacyEmployee'`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAttendance();
