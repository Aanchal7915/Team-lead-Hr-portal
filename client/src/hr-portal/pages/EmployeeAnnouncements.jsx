import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { formatDate } from '../utils/formatDate';
import { FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/employee/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleMarkAsRead = async () => {
        try {
            await api.post('/employee/announcements/read');
            setAnnouncements(announcements.map(ann => ({ ...ann, isRead: true })));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const hasUnread = announcements.some(ann => !ann.isRead);

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#fff5e6]">
                <Spinner />
            </div>
        );

    return (
        <div className="min-h-screen bg-[#fff5e6] px-4 py-10 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-10 bg-[#8a6144] rounded-full"></div>
                        <h1 className="text-3xl font-bold text-[#433020] tracking-tight">Company Announcements</h1>
                    </div>
                    {hasUnread && (
                        <button
                            onClick={handleMarkAsRead}
                            className="bg-[#8a6144] hover:bg-[#6d4d36] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-sm transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            Mark All as Read
                        </button>
                    )}
                </div>

                {/* Announcement List */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {announcements.length > 0 ? (
                            announcements.map((ann, idx) => (
                                <motion.div
                                    key={ann._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-8 rounded-2xl bg-white shadow-md border border-gray-100 group transition-all duration-300"
                                >
                                    <h3 className="text-2xl font-bold text-[#433020] mb-1 tracking-tight">{ann.title}</h3>
                                    
                                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-400">
                                        <FaCalendarAlt className="text-red-500 text-xs" />
                                        <span>Posted on {formatDate(ann.createdAt)}</span>
                                    </div>

                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {ann.content}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 italic font-medium">No announcements found</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAnnouncements;
