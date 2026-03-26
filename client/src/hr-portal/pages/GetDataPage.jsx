

// import React, { uState, useEffect } from 'react';
// import api from "../api/api.js";
// import Spinner from '../components/Spinner.jsx';
// import { formatDate, formatTime } from '../utils/formatDate.js';

// const GetDataPage = () => {
//     const [loginRecords, setLoginRecords] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const { data } = await api.get('/hr/getdata');
//                 setLoginRecords(data);
//             } catch (error) {
//                 console.error("Failed to fetch login data", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, []);



//     const getDeviceType = (userAgent) => {
//         if (!userAgent) return 'Unknown';
//         if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
//             return 'Mobile';
//         }
//         if (userAgent.includes('Linux') && !userAgent.includes('Ubuntu')) {
//             return 'Desktop (Suspicious)';
//         }
//         if (userAgent.includes('Macintosh') || userAgent.includes('Windows')) {
//             return 'Desktop';
//         }
//         return 'Unknown';
//     };

//     if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

//     return (
//         <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-800">Employee Activity Log</h1>
//             <div className="overflow-x-auto bg-white rounded-lg shadow">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Type</th>
//                             <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Touch Device?</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Info</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Model</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {loginRecords.map(record => {
//                             const deviceType = getDeviceType(record.deviceInfo);
//                             const isSuspicious = record.isTouchDevice;

//                             return (
//                                 <tr key={record._id} className={record.action === 'Check-in' && isSuspicious ? 'bg-orange-50' : ''}>
//                                     <td className="px-6 py-4">
//                                         <p className="font-medium">{record.employeeId?.name || 'N/A'}</p>
//                                         <p className="text-sm text-gray-500">{record.employeeId?.employeeId || 'N/A'}</p>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.action === 'Login' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
//                                             {record.action}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 text-sm">{formatDate(record.createdAt)} at {formatTime(record.createdAt)}</td>
//                                     <td className="px-6 py-4 font-bold">{deviceType}</td>
//                                     <td className="px-6 py-4 text-center">
//                                         <span className={`px-3 py-1 text-xs font-bold rounded-full ${isSuspicious ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
//                                             {isSuspicious ? 'YES' : 'NO'}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 text-xs text-gray-600 truncate max-w-xs" title={record.deviceInfo}>{record.deviceInfo}</td>
//                                     <td className="px-6 py-4 text-xs">{record.ipAddress || 'N/A'}</td>

//                                     <td className="px-6 py-4 text-xs">
//  {record.location && record.location !== "Unknown" && record.latitude && record.longitude ? (
//   <a
//     href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}

//       target="_blank"
//       rel="noopener noreferrer"
//       className="text-blue-600 hover:underline flex items-center space-x-1"
//     >
//       <span>{record.location}</span>
//       <span role="img" aria-label="map">📍</span>
//     </a>
//   ) : (
//     "Unknown"
//   )}
// </td>
// <td className="px-6 py-4 text-xs font-semibold">{record.deviceModel || "Unknown"}</td>

//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default GetDataPage;

import React, { useState, useEffect } from 'react';
import api from "../api/api.js";
import Spinner from '../components/Spinner.jsx';
import { formatDate, formatTime } from '../utils/formatDate.js';

const GetDataPage = () => {
    console.log('testing page..........')
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
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-10 transition-colors duration-300">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 drop-shadow-sm flex items-center justify-center gap-3">
                📱 <span className="text-[#8a6144]">Device</span> Activity Log
            </h1>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 max-w-7xl mx-auto transition-all duration-300">
                <div className="flex flex-wrap justify-between items-center mb-8 gap-6">
                    <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                        📄 Logs for <span className="text-[#8a6144] italic">{new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</span>
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center bg-[#f5e6d3]/30 dark:bg-gray-700/30 p-3 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                            <label htmlFor="month-select" className="text-sm font-bold text-[#433020] dark:text-gray-200 uppercase tracking-wider">Month:</label>
                            <select
                                id="month-select"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] outline-none transition-all"
                            >
                                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-[#433020] dark:text-gray-200 uppercase tracking-wider">Year:</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] outline-none w-24 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#8a6144]/10 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                        <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Device Type</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Touch Device?</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Device Model</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                            {loginRecords.map(record => {
                                const isCheckinTouch = record.action === 'Check-in' && record.isTouchDevice;
                                return (
                                    <tr key={record._id} className={`${isCheckinTouch ? 'bg-orange-50/50 dark:bg-orange-900/10' : 'hover:bg-[#fffbf5] dark:hover:bg-gray-700/30'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-bold text-[#433020] dark:text-gray-100">{record.employeeId?.name || 'N/A'}</p>
                                            <p className="text-[11px] font-bold text-[#8a6144] dark:text-gray-400 uppercase tracking-tighter">{record.employeeId?.employeeId || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${record.action === 'Login'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {record.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#433020] dark:text-gray-300">
                                            <span className="font-bold">{formatDate(record.createdAt)}</span>
                                            <span className="block text-[11px] text-[#8a6144] dark:text-gray-500 font-medium">{formatTime(record.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`flex items-center gap-2 font-bold ${record.isTouchDevice ? 'text-[#8a6144]' : 'text-[#433020] dark:text-gray-300'}`}>
                                                {record.isTouchDevice ? '📱 Mobile' : '💻 Desktop'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className={`px-4 py-1 text-[10px] font-black rounded-full shadow-sm ${record.isTouchDevice
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                }`}>
                                                {record.isTouchDevice ? 'YES' : 'NO'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#8a6144] dark:text-gray-400">
                                            {record.ipAddress || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {record.location && record.location !== "Unknown" && record.latitude && record.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold italic"
                                                >
                                                    <span>{record.location}</span>
                                                    <span className="text-base">📍</span>
                                                </a>
                                            ) : (
                                                <span className="text-[#8a6144]/40 dark:text-gray-600 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#433020] dark:text-gray-200">
                                            {record.deviceModel || "Unknown"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GetDataPage;
