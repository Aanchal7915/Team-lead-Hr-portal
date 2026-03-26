const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Employee = require('../hr-portal-backend/models/Employee');

const mapRole = (role) => {
    if (role === 'hr') return 'hr';
    if (role === 'admin') return 'admin';
    if (role === 'team_lead') return 'team_lead';
    return 'team_member';
};

const mapDepartment = (user) => {
    if (user.role === 'hr' || user.role === 'admin') return 'HR';
    if (user.designation && String(user.designation).trim()) return String(user.designation).trim();
    return 'General';
};

const mapLoginStatus = (status) => {
    if (status === 'online' || status === 'busy') return status;
    return 'offline';
};

const migrate = async () => {
    const dryRun = process.argv.includes('--dry-run');
    const users = await User.find({}).select('+password').lean();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const user of users) {
        try {
            if (!user.email) {
                skipped += 1;
                continue;
            }

            const payload = {
                name: user.name || 'Employee',
                email: String(user.email).toLowerCase(),
                password: user.password,
                role: mapRole(user.role),
                department: mapDepartment(user),
                phone: user.phone || '',
                address: user.address || '',
                loginStatus: mapLoginStatus(user.status),
                isActive: user.isActive !== false,
                avatar: user.avatar || '',
                teamId: user.teamId || undefined,
                designation: user.designation || '',
                coreField: user.coreField || '',
                skills: Array.isArray(user.skills) ? user.skills : [],
                lastActive: user.lastActive || new Date(),
                lastLogin: user.lastLogin || null,
                forcePasswordChange: Boolean(user.forcePasswordChange),
                deletedAt: user.deletedAt || null,
                status: user.isActive === false ? 'Deactivated' : 'Active'
            };

            const existing = await Employee.findOne({ email: payload.email }).select('_id').lean();

            if (dryRun) {
                if (existing) updated += 1;
                else created += 1;
                continue;
            }

            if (existing) {
                await Employee.updateOne({ _id: existing._id }, { $set: payload });
                updated += 1;
            } else {
                const tempPassword = `${Math.random().toString(36).slice(2)}${Date.now()}`;
                const inserted = await Employee.create({
                    ...payload,
                    password: tempPassword
                });
                // Preserve original user password hash (do not re-hash).
                await Employee.updateOne(
                    { _id: inserted._id },
                    { $set: { password: payload.password } }
                );
                created += 1;
            }
        } catch (error) {
            failed += 1;
            console.error(`Failed for user ${user.email || user._id}:`, error.message);
        }
    }

    return { totalUsers: users.length, created, updated, skipped, failed, dryRun };
};

const run = async () => {
    try {
        await connectDB();
        const result = await migrate();
        console.log('Migration complete:', result);
        await mongoose.connection.close();
        process.exit(result.failed > 0 ? 1 : 0);
    } catch (error) {
        console.error('Migration failed:', error);
        try {
            await mongoose.connection.close();
        } catch (_) {
            // ignore close errors
        }
        process.exit(1);
    }
};

run();
