import React, { useState, useEffect } from 'react';
import api from "../../hr-portal/api/api.js";
import Button from '../../hr-portal/components/Button.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import { formatDate } from '../../hr-portal/utils/formatDate.js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

const ApplyLeave = () => {
    const [leaveDate, setLeaveDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const preloadedContent = `To,\nThe HR Department,\nAVANI ENTERPRISES\n\nDate: ${formatDate(new Date())}\n\nSubject: Leave Application for ${leaveDate ? formatDate(leaveDate) : '[Selected Date]'}\n\nRespected Sir/Madam,\n\n`;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoadingHistory(true);
                const { data } = await api.get('/employee/leave/history');
                setLeaveHistory(data);
            } catch (error) {
                console.error("Failed to fetch leave history", error);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, []);

    if (loadingHistory) return (
        <Layout title="Apply for Leave">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const fullReason = preloadedContent + reason;
            await api.post('/employee/leave', { leaveDate, reason: fullReason });
            setMessage('✅ Your leave application has been submitted successfully.');
            setLeaveDate('');
            setReason('');
            // Refresh history
            const { data } = await api.get('/employee/leave/history');
            setLeaveHistory(data);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Failed to submit application. Please try again.';
            setMessage(`${errMsg}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusStyles = {
        Pending: 'bg-yellow-100 text-yellow-800',
        Approved: 'bg-green-100 text-green-800',
        Declined: 'bg-red-100 text-red-800',
    };

    return (
        <Layout title="Apply for Leave">
            <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 md:p-10 -m-4 md:-m-8 rounded-xl space-y-10 transition-colors duration-300">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-4xl font-extrabold text-[#433020] dark:text-gray-100 mb-6 drop-shadow-sm tracking-tight text-center">📝 Leave Management</h1>

                    {/* Form */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 p-6 space-y-6 transition-all hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
                        <h2 className="text-lg md:text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                            <span className="w-2 h-8 bg-[#8a6144] rounded-full inline-block"></span>
                            Apply for a New Leave
                        </h2>

                        {message && (
                            <p className={`p-3 rounded-md text-sm font-medium ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="leaveDate" className="block text-xs font-bold text-[#8a6144] dark:text-[#d3a37f] mb-2 font-mono uppercase tracking-widest">Leave Date</label>
                                <input
                                    type="date"
                                    id="leaveDate"
                                    value={leaveDate}
                                    onChange={(e) => setLeaveDate(e.target.value)}
                                    required
                                    className="w-full !px-4 !py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-4 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all duration-300 shadow-sm font-medium h-[45px] text-sm text-[#433020] dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Leave</label>
                                <div className="mt-1 p-3 bg-[#fffbf5] dark:bg-gray-700 text-sm text-[#433020] dark:text-gray-200 border border-[#8a6144]/20 dark:border-gray-600 rounded-lg whitespace-pre-line font-mono">
                                    {preloadedContent}
                                </div>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows="6"
                                    placeholder="Please state the reason for your leave..."
                                    className="mt-2 block w-full p-3 border border-[#8a6144]/30 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-[#8a6144] dark:focus:ring-gray-500 bg-white/50 dark:bg-gray-700 text-[#433020] dark:text-gray-100 outline-none"
                                />
                            </div>

                            <Button type="submit" disabled={loading} variant="brand" className="w-full">
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </form>
                    </div>

                    {/* History */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 p-6 mt-10 transition-all hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
                        <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 bg-[#8a6144] rounded-full inline-block"></span>
                            Leave History
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-[#fffcf7] dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-[#8a6144] dark:text-gray-200 uppercase">Applied On</th>
                                        <th className="px-6 py-4 text-left font-bold text-[#8a6144] dark:text-gray-200 uppercase">Leave Date</th>
                                        <th className="px-6 py-4 text-left font-bold text-[#8a6144] dark:text-gray-200 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-100 dark:divide-gray-700">
                                    {leaveHistory.map((req) => (
                                        <tr key={req._id}>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-300">{formatDate(req.createdAt)}</td>
                                            <td className="px-6 py-4 text-gray-800 dark:text-gray-100">{formatDate(req.leaveDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[req.status]}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaveHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">No leave history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default ApplyLeave;
