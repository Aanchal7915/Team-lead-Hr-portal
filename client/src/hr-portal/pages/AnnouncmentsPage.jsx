import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { formatDate } from '../utils/formatDate';
import { FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/hr/announcements');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/hr/announcements', { title, content });
            setTitle('');
            setContent('');
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to create announcement', error);
            alert('Could not create announcement.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-10 bg-[#8a6144] rounded-full"></div>
                    <h1 className="text-3xl font-bold text-[#433020] tracking-tight">Company Announcements</h1>
                </div>

                {/* Create Section */}
                <div className="bg-white rounded-2xl shadow-md p-8 md:p-10 border border-gray-100">
                    <h2 className="text-2xl font-bold text-[#433020] mb-8">Create New Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="What is this announcement about?"
                                className="w-full px-4 py-3 rounded-xl bg-[#fffbf5] border border-gray-200 text-[#433020] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8a6144]/20 focus:border-[#8a6144] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                rows="5"
                                placeholder="Describe the announcement in detail..."
                                className="w-full px-4 py-3 rounded-xl bg-[#fffbf5] border border-gray-200 text-[#433020] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8a6144]/20 focus:border-[#8a6144] transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-start">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#8a6144] hover:bg-[#6d4d36] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
                            >
                                {isSubmitting ? 'Posting...' : 'Post Announcement'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Announcement List */}
                <div className="space-y-8">
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

export default AnnouncementsPage;
