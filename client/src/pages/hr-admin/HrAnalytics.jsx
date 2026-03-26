import React, { useState, useEffect } from 'react';
import api from "../../hr-portal/api/api.js";
import Spinner from '../../hr-portal/components/Spinner.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../../components/Layout';

const AnalyticsStatCard = ({ title, value, description }) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.02] animate-fade-in group">
        <p className="text-sm font-bold text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-4xl font-extrabold text-[#433020] dark:text-gray-100 mt-2">{value}</p>
        <div className="mt-3 flex items-center">
            <span className="text-xs font-medium text-[#6b4d36] dark:text-gray-400 bg-[#fff5e6] dark:bg-gray-700/50 px-2 py-1 rounded-full border border-[#8a6144]/10">
                {description}
            </span>
        </div>
    </div>
);

const HrAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/hr/analytics/consolidated?month=${month}&year=${year}`);
                setAnalyticsData(data);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [month, year]);

    if (loading) return (
        <Layout title="Analytics">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    if (!analyticsData) return (
        <Layout title="Analytics">
            <p className="text-center text-gray-500">Could not load analytics data.</p>
        </Layout>
    );

    const { totalLateSignIns, totalUnpaidLeaves, dailyTrends, consolidatedData } = analyticsData;

    return (
        <Layout title="Company-Wide Analytics">
            <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6 space-y-10 transition-colors duration-300">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 animate-fade-in-up drop-shadow-sm">
                    <span className="text-[#8a6144]">Company-Wide</span> Analytics
                </h1>

                {/* Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-wrap gap-4 sm:gap-6 items-center justify-center animate-fade-in max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-[#433020] dark:text-gray-200">Select Month:</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] outline-none transition-all"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-[#433020] dark:text-gray-200">Year:</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] outline-none w-28 transition-all"
                        />
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    <AnalyticsStatCard
                        title="Total Late Sign-ins"
                        value={totalLateSignIns}
                        description={`For ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })}`}
                    />
                    <AnalyticsStatCard
                        title="Total Unpaid Leaves"
                        value={totalUnpaidLeaves}
                        description="Across all employees"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in group hover:shadow-2xl hover:shadow-[#433020]/10 transition-all">
                        <h3 className="text-xl font-bold mb-6 text-[#433020] dark:text-gray-100 flex items-center gap-3">
                            <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">📈</span>
                            Daily Timely Sign-in Rate (%)
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a6144', fontSize: 12, fontWeight: 700 }} />
                                <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#8a6144', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 30px -10px rgba(67, 48, 32, 0.15)', padding: '16px' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="timelySignInPercentage" name="Timely Sign-in %" stroke="#22c55e" strokeWidth={4} fill="url(#colorGreen)" />
                                <defs>
                                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in group hover:shadow-2xl hover:shadow-[#433020]/10 transition-all">
                        <h3 className="text-xl font-bold mb-6 text-[#433020] dark:text-gray-100 flex items-center gap-3">
                            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">📊</span>
                            Daily EOD Submission Rate (%)
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a6144', fontSize: 12, fontWeight: 700 }} />
                                <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#8a6144', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 30px -10px rgba(67, 48, 32, 0.15)', padding: '16px' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="eodSubmissionPercentage" name="EOD Submitted %" stroke="#3b82f6" strokeWidth={4} fill="url(#colorBlue)" />
                                <defs>
                                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto">
                    <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
                        <h2 className="text-3xl font-black text-[#433020] dark:text-gray-100 flex items-center gap-4">
                            📋 Performance Intelligence
                        </h2>
                        <p className="text-sm font-bold text-[#8a6144] dark:text-gray-400 font-sans mt-2 italic">
                            Monthly Summary for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                        </p>
                    </div>
                    <div className="overflow-x-auto rounded-[2rem] border border-[#8a6144]/15 dark:border-gray-700 shadow-inner">
                        <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-8 py-5 text-left text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">Employee</th>
                                    <th className="px-8 py-5 text-left text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">Department</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">Late Sign-ins</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">Late Rate %</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">Unpaid Leaves</th>
                                    <th className="px-8 py-5 text-center text-xs font-black text-[#8a6144] dark:text-gray-300 uppercase tracking-[0.2em]">EOD Compliance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                                {consolidatedData.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition-all group duration-300">
                                        <td className="px-8 py-5 font-black text-[#433020] dark:text-gray-100 whitespace-nowrap group-hover:text-[#8a6144] transition-colors">{emp.name}</td>
                                        <td className="px-8 py-5 text-[#6b4d36] dark:text-gray-400 font-bold whitespace-nowrap italic">{emp.department}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${emp.lateSignIns > 0 ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-200/50' : 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-200/50'}`}>
                                                {emp.lateSignIns}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${parseInt(emp.lateSignInPercentage) > 10 ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-200/50' : 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-200/50'}`}>
                                                {String(emp.lateSignInPercentage).replace('%', '')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${emp.unpaidLeaves > 0 ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-200/50' : 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-200/50'}`}>
                                                {emp.unpaidLeaves}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest ${parseInt(emp.eodCompliance) < 90 ? 'bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-200/50' : 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-200/50'}`}>
                                                {String(emp.eodCompliance).replace('%', '')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HrAnalytics;
