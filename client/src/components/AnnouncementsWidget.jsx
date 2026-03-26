import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';
import { announcementsAPI } from '../services/api';
import moment from 'moment';

const AnnouncementsWidget = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await announcementsAPI.getActive();
            if (res.data?.data) {
                setAnnouncements(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
            // mock
            setAnnouncements([
                { _id: '1', title: 'Q3 Townhall Meeting', content: 'Join us this Friday for the quarterly townhall meeting...', priority: 'High', createdAt: new Date() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (announcements.length === 0) return null;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                Latest Announcements
            </h3>
            <div className="space-y-3">
                {announcements.slice(0, 3).map(ann => (
                    <div key={ann._id} className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100 border-l-4" style={{ borderLeftColor: ann.priority === 'High' ? '#ef4444' : ann.priority === 'Low' ? '#10b981' : '#3b82f6' }}>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 text-sm">{ann.title}</h4>
                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {moment(ann.createdAt).format('MMM DD')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnnouncementsWidget;
