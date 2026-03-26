import React, { useState, useEffect } from 'react';
import api from "../../hr-portal/api/api.js";
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Button from '../../hr-portal/components/Button.jsx';
import { formatDate } from '../../hr-portal/utils/formatDate.js';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';

const EmployeeAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/employee/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            // Even if it's the employee view, we use the same post endpoint if they have permissions
            await api.post('/hr/announcements', { title, content });
            setTitle('');
            setContent('');
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to create announcement', error);
            alert('Could not create announcement. You might not have permission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAsRead = async () => {
        try {
            await api.post('/employee/announcements/read');
            setAnnouncements(announcements.map(ann => ({ ...ann, isRead: true })));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    if (loading)
        return (
            <Layout title="Company Announcements">
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            </Layout>
        );

    return (
        <Layout title="Company Announcements">
            {/* Custom Background Overlay to match the beige theme in screenshot */}
            <div className="fixed inset-0 bg-[#fff9f1] -z-10" />

            <div className="max-w-4xl mx-auto py-10 px-4 space-y-12">
                {/* Main Header */}
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-[#8a6144] rounded-full"></div>
                    <h1 className="text-3xl font-black text-[#433020] tracking-tight">Company Announcements</h1>
                </div>

                {/* Create Section - Included as per Image 1 URL */}
                {/* <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#8a6144]/5 border border-[#8a6144]/10 p-10 overflow-hidden relative">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="text-2xl">📝</span>
                        <h2 className="text-2xl font-black text-[#433020] tracking-tight text-opacity-90">Create New Announcement</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-[#8a6144]/60 uppercase tracking-[0.2em] ml-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="What is this announcement about?"
                                className="w-full px-6 py-4 rounded-2xl bg-[#fffbf5] border border-[#8a6144]/15 text-[#433020] placeholder-[#8a6144]/30 focus:outline-none focus:ring-4 focus:ring-[#8a6144]/5 focus:border-[#8a6144]/40 transition-all duration-300 font-medium"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-[#8a6144]/60 uppercase tracking-[0.2em] ml-2">Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows="6"
                                placeholder="Describe the announcement in detail..."
                                className="w-full px-6 py-5 rounded-[2rem] bg-[#fffbf5] border border-[#8a6144]/15 text-[#433020] placeholder-[#8a6144]/30 focus:outline-none focus:ring-4 focus:ring-[#8a6144]/5 focus:border-[#8a6144]/40 transition-all duration-300 font-medium leading-relaxed resize-none"
                            />
                        </div>

                        <div className="flex justify-start">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#8a6144] hover:bg-[#6d4d36] text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-[#8a6144]/20 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                🚀 {isSubmitting ? 'Posting...' : 'Post Announcement'}
                            </button>
                        </div>
                    </form>
                </div> */}

                {/* Posted Section */}
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#8a6144]/5 border border-[#8a6144]/10 p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📌</span>
                            <h2 className="text-2xl font-black text-[#433020] tracking-tight text-opacity-90">Posted Announcements</h2>
                        </div>
                        {/* {announcements.some(a => !a.isRead) && (
                            <button onClick={handleMarkAsRead} className="text-[10px] font-black text-[#8a6144] uppercase tracking-widest hover:underline">
                                Mark all read
                            </button>
                        )} */}
                    </div>

                    <div className="space-y-12">
                        <AnimatePresence>
                            {announcements.length > 0 ? (
                                announcements.map((ann, idx) => (
                                    <motion.div
                                        key={ann._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`group pb-12 border-b border-[#8a6144]/10 last:border-0 last:pb-0 relative ${!ann.isRead ? 'border-l-4 border-l-[#8a6144] pl-6' : ''}`}
                                    >
                                        {/* {!ann.isRead && (
                                            <div className="absolute top-0 right-0">
                                         <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse text-xs">NEW</span>
                                            </div>
                                        )} */}
                                        <h3 className="text-2xl font-black text-[#433020] group-hover:text-[#8a6144] transition-colors duration-300 mb-4 tracking-tight">{ann.title}</h3>

                                        <div className="flex mb-6 text-xs">
                                            <div className="bg-[#fff9f1] px-4 py-2 rounded-full border border-[#8a6144]/10 flex items-center gap-2">
                                                <span className="text-[10px]">🗓️</span>
                                                <span className="text-[10px] font-black text-[#8a6144] uppercase tracking-wider">
                                                    Posted by {ann.createdBy?.name || 'Management'} on {formatDate(ann.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-[#433020]/80 font-medium leading-relaxed whitespace-pre-wrap pl-1 border-l-2 border-[#8a6144]/10">
                                            {ann.content}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-[#fff9f1]/50 rounded-[2rem] border border-dashed border-[#8a6144]/20">
                                    <p className="text-[#8a6144]/40 font-black uppercase tracking-[0.2em] italic">No active announcements</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default EmployeeAnnouncements;
