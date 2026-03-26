const Announcement = require('../models/Announcement');

// @desc    Get all active & non-expired announcements for employees
// @route   GET /api/employee/announcements
// @access  Private (all authenticated users)
exports.getEmployeeAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            status: 'Active',
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate('author', 'name role')
            .sort({ pinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all active announcements for users (legacy endpoint)
// @route   GET /api/announcements/active
// @access  Private
exports.getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            status: 'Active',
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        })
            .populate('author', 'name role')
            .sort({ pinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all announcements (HR Admin only)
// @route   GET /api/announcements
// @access  Private/Admin/HR
exports.getAllAnnouncements = async (req, res) => {
    try {
        const { priority } = req.query;
        const filter = {};
        if (priority && priority !== 'All') {
            filter.priority = priority;
        }

        const announcements = await Announcement.find(filter)
            .populate('author', 'name role')
            .sort({ pinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private/Admin/HR
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, status, priority, pinned, expiresAt } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const announcement = await Announcement.create({
            title,
            content,
            status: status || 'Active',
            priority: priority || 'Medium',
            pinned: pinned || false,
            expiresAt: expiresAt || null,
            author: req.user._id || req.user.id
        });

        const populated = await announcement.populate('author', 'name role');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin/HR
exports.updateAnnouncement = async (req, res) => {
    try {
        let announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        const { title, content, status, priority, pinned, expiresAt } = req.body;

        announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { title, content, status, priority, pinned, expiresAt },
            { new: true, runValidators: true }
        ).populate('author', 'name role');

        res.status(200).json({ success: true, data: announcement });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin/HR
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        await announcement.deleteOne();
        res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
};
