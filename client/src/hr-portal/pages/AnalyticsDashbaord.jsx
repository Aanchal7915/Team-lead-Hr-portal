
import React, { useState, useEffect } from 'react';
import api from "../api/api.js";
import Spinner from '../components/Spinner.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const AnalyticsStatCard = ({ title, value, description }) => (
//     <div className="bg-white p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 animate-fade-in">
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <p className="text-4xl font-bold text-indigo-700 mt-1">{value}</p>
//         <p className="text-xs text-gray-400 mt-2">{description}</p>
//     </div>
// );

// const AnalyticsDashboard = () => {
//     const [analyticsData, setAnalyticsData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());

//     useEffect(() => {
//         const fetchAnalytics = async () => {
//             try {
//                 setLoading(true);
//                 const { data } = await api.get(`/hr/analytics/consolidated?month=${month}&year=${year}`);
//                 setAnalyticsData(data);
//             } catch (error) {
//                 console.error("Failed to fetch analytics data", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAnalytics();
//     }, [month, year]);

//     if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
//     if (!analyticsData) return <p className="text-center text-gray-500">Could not load analytics data.</p>;

//     const { totalLateSignIns, totalUnpaidLeaves, dailyTrends, consolidatedData } = analyticsData;

//     return (
//         <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-pink-50 p-6 space-y-10">
//             <h1 className="text-4xl font-extrabold text-center text-gray-800 animate-fade-in-up">Company-Wide Analytics</h1>

//             {/* Filters */}
//             <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap gap-4 items-center justify-center animate-fade-in">
//                 <label className="text-sm font-medium text-gray-700">Select Period:</label>
//                 <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
//                     {Array.from({ length: 12 }, (_, i) => (
//                         <option key={i + 1} value={i + 1}>
//                             {new Date(0, i).toLocaleString('default', { month: 'long' })}
//                         </option>
//                     ))}
//                 </select>
//                 <input
//                     type="number"
//                     value={year}
//                     onChange={(e) => setYear(e.target.value)}
//                     className="p-2 border border-gray-300 rounded-lg w-28"
//                 />
//             </div>

//             {/* Stat Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <AnalyticsStatCard
//                     title="Total Late Sign-ins"
//                     value={totalLateSignIns}
//                     description={`For ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })}`}
//                 />
//                 <AnalyticsStatCard
//                     title="Total Unpaid Leaves"
//                     value={totalUnpaidLeaves}
//                     description="Across all employees"
//                 />
//             </div>

//             {/* Charts */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="bg-white p-6 rounded-xl shadow-xl animate-fade-in">
//                     <h3 className="text-xl font-semibold mb-4 text-gray-700">Daily Timely Sign-in Rate (%)</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <AreaChart data={dailyTrends}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="name" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
//                             <YAxis domain={[0, 100]} unit="%" />
//                             <Tooltip />
//                             <Legend />
//                             <Area type="monotone" dataKey="timelySignInPercentage" name="Timely Sign-in %" stroke="#22c55e" fill="#bbf7d0" />
//                         </AreaChart>
//                     </ResponsiveContainer>
//                 </div>

//                 <div className="bg-white p-6 rounded-xl shadow-xl animate-fade-in">
//                     <h3 className="text-xl font-semibold mb-4 text-gray-700">Daily EOD Submission Rate (%)</h3>
//                     <ResponsiveContainer width="100%" height={300}>
//                         <AreaChart data={dailyTrends}>
//                             <CartesianGrid strokeDasharray="3 3" />
//                             <XAxis dataKey="name" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
//                             <YAxis domain={[0, 100]} unit="%" />
//                             <Tooltip />
//                             <Legend />
//                             <Area type="monotone" dataKey="eodSubmissionPercentage" name="EOD Submitted %" stroke="#3b82f6" fill="#dbeafe" />
//                         </AreaChart>
//                     </ResponsiveContainer>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
//                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">
//                     Employee Performance Summary for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}
//                 </h2>
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Employee</th>
//                                 <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Department</th>
//                                 <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Late Sign-ins</th>
//                                 <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Unpaid Leaves</th>
//                                 <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">EOD Compliance</th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-100">
//                             {consolidatedData.map((emp) => (
//                                 <tr key={emp.id} className="hover:bg-blue-50 transition duration-200">
//                                     <td className="px-6 py-4 font-medium whitespace-nowrap">{emp.name}</td>
//                                     <td className="px-6 py-4 whitespace-nowrap">{emp.department}</td>
//                                     <td className={`px-6 py-4 text-center font-bold ${emp.lateSignIns > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded`}>
//                                         {emp.lateSignIns}
//                                     </td>
//                                     <td className={`px-6 py-4 text-center font-bold ${emp.unpaidLeaves > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded`}>
//                                         {emp.unpaidLeaves}
//                                     </td>
//                                     <td className={`px-6 py-4 text-center font-bold ${parseInt(emp.eodCompliance) < 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded`}>
//                                         {emp.eodCompliance}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AnalyticsDashboard;

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

const AnalyticsDashboard = () => {
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
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );
    if (!analyticsData) return <p className="text-center text-gray-500">Could not load analytics data.</p>;

    const { totalLateSignIns, totalUnpaidLeaves, dailyTrends, consolidatedData } = analyticsData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-10 transition-colors duration-300">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 animate-fade-in-up drop-shadow-sm">
                <span className="text-[#8a6144]">Company-Wide</span> Analytics
            </h1>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-wrap gap-6 items-center justify-center animate-fade-in max-w-4xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold mb-6 text-[#433020] dark:text-gray-100 flex items-center gap-2">
                        <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">📈</span>
                        Daily Timely Sign-in Rate (%)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Area type="monotone" dataKey="timelySignInPercentage" name="Timely Sign-in %" stroke="#22c55e" strokeWidth={3} fill="url(#colorGreen)" />
                            <defs>
                                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold mb-6 text-[#433020] dark:text-gray-100 flex items-center gap-2">
                        <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">📊</span>
                        Daily EOD Submission Rate (%)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Area type="monotone" dataKey="eodSubmissionPercentage" name="EOD Submitted %" stroke="#3b82f6" strokeWidth={3} fill="url(#colorBlue)" />
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
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-3">
                        📋 Performance Summary
                    </h2>
                    <p className="text-sm font-normal text-[#8a6144] dark:text-gray-400 font-sans mt-1">
                        for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}
                    </p>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-[#8a6144]/10 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                        <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Late Sign-ins</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Late Sign-in %</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Unpaid Leaves</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">EOD Compliance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                            {consolidatedData.map((emp) => (
                                <tr key={emp.id} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition duration-200">
                                    <td className="px-6 py-4 font-bold text-[#433020] dark:text-gray-100 whitespace-nowrap">{emp.name}</td>
                                    <td className="px-6 py-4 text-[#6b4d36] dark:text-gray-400 whitespace-nowrap">{emp.department}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.lateSignIns > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {emp.lateSignIns}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${parseInt(emp.lateSignInPercentage) > 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {emp.lateSignInPercentage}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.unpaidLeaves > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {emp.unpaidLeaves}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${parseInt(emp.eodCompliance) < 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {emp.eodCompliance}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
