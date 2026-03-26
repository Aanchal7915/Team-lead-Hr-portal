import React, { useState, useEffect } from 'react';
import api from "../../hr-portal/api/api.js";
import Spinner from '../../hr-portal/components/Spinner.jsx';
import { formatDate, formatTime } from '../../hr-portal/utils/formatDate.js';
import Layout from '../../components/Layout';

const AttendanceLogs = () => {
    const [loginRecords, setLoginRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/hr/getdata?month=${month}&year=${year}`);
                setLoginRecords(data);
            } catch (error) {
                console.error("Failed to fetch login data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [month, year]);

    if (loading) return (
        <Layout title="Device Activity Log">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    return (
        <Layout title="Human Activity Insights">
            <div className="space-y-10 px-3 sm:px-0">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 max-w-7xl mx-auto transition-all duration-300">
                    <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-10 gap-8">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-black text-[#433020] dark:text-gray-100 flex items-center gap-3">
                                <span className="p-2 bg-[#8a6144]/10 rounded-lg">📱</span>
                                Device Intelligence Log
                            </h2>
                            <p className="text-sm font-bold text-[#8a6144] italic mt-2 uppercase tracking-tight">Active session tracking for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center bg-[#f5e6d3]/30 dark:bg-gray-700/30 p-4 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600 shadow-inner">
                            <div className="flex items-center gap-3">
                                <label htmlFor="month-select" className="text-[10px] font-black text-[#8a6144] uppercase tracking-widest ml-2">Month</label>
                                <select
                                    id="month-select"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="p-3 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 font-bold focus:ring-4 focus:ring-[#8a6144]/10 outline-none transition-all shadow-sm"
                                >
                                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[10px] font-black text-[#8a6144] uppercase tracking-widest">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="p-3 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 font-bold focus:ring-4 focus:ring-[#8a6144]/10 outline-none w-28 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-[2.5rem] border border-[#8a6144]/15 dark:border-gray-700 shadow-inner">
                        <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Contributor</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Event</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Timestamp</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Hardware</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Touch-ID</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">IP Trace</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Physical Node</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                                {loginRecords.map(record => {
                                    const isSuspicious = record.action === 'Check-in' && record.isTouchDevice;
                                    return (
                                        <tr key={record._id} className={`${isSuspicious ? 'bg-orange-50/70 dark:bg-orange-900/10 active-suspicion' : 'hover:bg-[#fffbf5] dark:hover:bg-gray-700/30'} transition-all duration-300 group`}>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <p className="font-black text-[#433020] dark:text-gray-100 uppercase tracking-tighter group-hover:text-[#8a6144] transition-colors">{record.employeeId?.name || 'Unknown Entity'}</p>
                                                <p className="text-[9px] font-black text-[#8a6144] dark:text-gray-500 uppercase tracking-widest">{record.employeeId?.employeeId || 'ID-MISSING'}</p>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm border ${record.action === 'Login'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                                    : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                    }`}>
                                                    {record.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <p className="text-xs font-black text-[#433020] dark:text-gray-300 italic">{formatDate(record.createdAt)}</p>
                                                <p className="text-[10px] text-[#8a6144] dark:text-gray-500 font-bold uppercase tracking-widest">{formatTime(record.createdAt)}</p>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className={`flex items-center gap-2 font-black text-[11px] uppercase tracking-tighter ${record.isTouchDevice ? 'text-[#8a6144]' : 'text-[#433020] dark:text-gray-300'}`}>
                                                    {record.isTouchDevice ? '📱 Mobile' : '💻 Desktop'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center whitespace-nowrap">
                                                <span className={`px-5 py-1.5 text-[9px] font-black rounded-full shadow-md ${record.isTouchDevice
                                                    ? 'bg-red-500 text-white animate-pulse'
                                                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                    }`}>
                                                    {record.isTouchDevice ? 'CONFIRMED' : 'REJECTED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-[10px] font-black font-mono text-[#8a6144] dark:text-gray-500 tracking-wider">
                                                {record.ipAddress || '0.0.0.0'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {record.location && record.location !== "Unknown" && record.latitude && record.longitude ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-black italic text-xs flex items-center gap-1.5 group/loc"
                                                    >
                                                        <span className="border-b-2 border-transparent group-hover/loc:border-blue-600 transition-all">{record.location}</span>
                                                        <span className="text-sm transform group-hover/loc:scale-125 transition-transform">📍</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-[#8a6144]/30 dark:text-gray-600 italic font-bold text-[10px] uppercase tracking-widest">Geo-Lost</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AttendanceLogs;
