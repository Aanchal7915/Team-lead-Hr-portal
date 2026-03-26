import React, { useState, useEffect, useMemo } from 'react';
import api from "../../hr-portal/api/api.js";
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Modal from '../../hr-portal/components/Modal.jsx';
import { formatDate } from '../../hr-portal/utils/formatDate.js';
import Button from '../../hr-portal/components/Button.jsx';
import Layout from '../../components/Layout';

const EodReports = () => {
    const [allReports, setAllReports] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [notSubmitted, setNotSubmitted] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedEod, setSelectedEod] = useState(null);
    const [isEodModalOpen, setEodModalOpen] = useState(false);

    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isMonthlyReportModalOpen, setMonthlyReportModalOpen] = useState(false);
    const [monthlyReportData, setMonthlyReportData] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [allReportsRes, allEmployeesRes] = await Promise.all([
                    api.get('/hr/eod-reports'),
                    api.get('/hr/employees')
                ]);
                setAllReports(allReportsRes.data.reports || []);
                setEmployees(allEmployeesRes.data || []);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchNotSubmitted = async () => {
            try {
                const { data: eodData } = await api.get(`/hr/eod-reports?date=${filterDate}`);
                setNotSubmitted(eodData.notSubmittedList || []);
            } catch (error) {
                console.error("Failed to fetch non-submission data", error);
            }
        };
        fetchNotSubmitted();
    }, [filterDate]);

    const filteredReports = useMemo(() => {
        return allReports
            .filter(report => report.date.startsWith(filterDate))
            .filter(report => {
                if (!report.employeeId) return false;
                if (!searchTerm) return true;
                const nameMatch = report.employeeId.name && report.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase());
                const idMatch = report.employeeId.employeeId && report.employeeId.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
                return nameMatch || idMatch;
            });
    }, [allReports, searchTerm, filterDate]);

    const handleCardClick = (report) => {
        setSelectedEod(report);
        setEodModalOpen(true);
    };

    const handleGenerateMonthlyReport = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthReports = allReports.filter(report => {
            const reportDate = new Date(report.date);
            return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
        });

        const eodCounts = {};
        monthReports.forEach(report => {
            if (report.employeeId) {
                const empId = report.employeeId._id;
                if (!eodCounts[empId]) {
                    eodCounts[empId] = 0;
                }
                eodCounts[empId] += 1;
            }
        });

        const reportData = employees.map(emp => ({
            name: emp.name,
            department: emp.department,
            count: eodCounts[emp._id] || 0,
        }));

        setMonthlyReportData(reportData);
        setMonthlyReportModalOpen(true);
    };

    if (loading) return (
        <Layout title="EOD Reports">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    return (
        <Layout title="End-of-Day Reports">
            <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6 space-y-10 transition-colors duration-300">
                <div className="flex flex-wrap justify-between items-center gap-4 max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-[#433020] dark:text-gray-100 drop-shadow-sm flex items-center gap-3 italic whitespace-nowrap">
                        📄 End-of-Day <span className="text-[#8a6144] not-italic">Reports</span>
                    </h1>
                    <Button onClick={handleGenerateMonthlyReport} variant="brand" className="rounded-full px-8 shadow-lg shadow-[#8a6144]/20">
                        Generate Monthly Report
                    </Button>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 flex flex-wrap gap-4 sm:gap-6 items-center max-w-7xl mx-auto w-full">
                    <div className="flex-grow min-w-0 flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 border border-[#8a6144]/20 dark:border-gray-600 rounded-2xl px-3.5 focus-within:ring-2 focus-within:ring-[#8a6144] transition-all">
                        <span className="text-[#8a6144] text-sm shrink-0">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full py-3.5 bg-transparent text-[#433020] dark:text-gray-100 outline-none placeholder-[#8a6144]/40 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-[#fffbf5] dark:bg-gray-700/50 p-2 px-4 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600">
                        <label className="text-sm font-bold text-[#8a6144] uppercase tracking-wider">Date:</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="bg-transparent text-[#433020] dark:text-gray-100 focus:outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-2xl shadow-sm max-w-7xl mx-auto w-full">
                    <h2 className="text-sm sm:text-xl font-bold text-orange-800 mb-3 leading-tight">⚠️ Pending EOD Submissions for {formatDate(filterDate)}</h2>
                    {notSubmitted.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                            {notSubmitted.map(emp => (
                                <li key={emp._id} className="text-orange-700">
                                    <span className="font-bold">{emp.name}</span> ({emp.department}) - ID: {emp.employeeId}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 italic">✅ All present employees have submitted their EOD reports for this date.</p>
                    )}
                </div>

                <div className="max-w-7xl mx-auto w-full">
                    <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 mb-6 flex items-center gap-2">
                        ✅ Submitted <span className="text-[#8a6144]">Reports</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredReports.map(report => (
                            <div
                                key={report._id}
                                onClick={() => handleCardClick(report)}
                                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xl font-bold text-[#433020] dark:text-gray-100 group-hover:text-[#8a6144] transition-colors">{report.employeeId.name}</p>
                                    <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest">EOD Report</span>
                                </div>
                                <p className="text-sm font-medium text-[#8a6144] dark:text-gray-400 mb-3">{report.employeeId.department} <span className="opacity-30">•</span> {report.employeeId.employeeId}</p>
                                <div className="bg-[#fffbf5] dark:bg-gray-700/50 p-4 rounded-2xl border border-[#8a6144]/5 flex flex-col justify-between h-24">
                                    <p className="text-[#433020] dark:text-gray-200 italic line-clamp-3 text-sm">"{report.eod}"</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#8a6144]/60 dark:text-gray-500 uppercase tracking-widest">
                                    <span>📅 {formatDate(report.date)}</span>
                                    <span className="group-hover:translate-x-1 transition-transform">Details →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedEod && (
                    <Modal isOpen={isEodModalOpen} onClose={() => setEodModalOpen(false)} title={`Report: ${selectedEod.employeeId.name}`}>
                        <div className="space-y-6 py-2">
                            <div className="flex items-center justify-between bg-[#fffbf5] dark:bg-gray-700/50 p-3 rounded-2xl border border-[#8a6144]/10">
                                <div>
                                    <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest">Employee Information</p>
                                    <p className="text-[#433020] dark:text-gray-100 font-bold">{selectedEod.employeeId.name} ({selectedEod.employeeId.employeeId})</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest">Submission Date</p>
                                    <p className="text-[#433020] dark:text-gray-100 font-bold">{formatDate(selectedEod.date)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest mb-2 px-1">Detailed Report</p>
                                <div className="text-[#433020] dark:text-gray-200 whitespace-pre-wrap bg-white/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-[#8a6144]/15 shadow-inner min-h-[150px] max-h-[400px] overflow-y-auto leading-relaxed">
                                    {selectedEod.eod}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={() => setEodModalOpen(false)} variant="secondary" className="px-8 rounded-full font-bold">Close</Button>
                        </div>
                    </Modal>
                )}

                {/* Monthly Report Modal */}
                <Modal isOpen={isMonthlyReportModalOpen} onClose={() => setMonthlyReportModalOpen(false)} title="📆 Monthly EOD Submission Report">
                    <div className="overflow-x-auto rounded-2xl border border-[#8a6144]/10 dark:border-gray-700 mt-4">
                        <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">EODs This Month</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                                {monthlyReportData.map(item => (
                                    <tr key={item.name} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#433020] dark:text-gray-100">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a6144] dark:text-gray-400 font-medium">{item.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-center text-[#433020] dark:text-gray-100">
                                            <span className="bg-[#8a6144]/10 dark:bg-[#8a6144]/20 px-3 py-1 rounded-full">{item.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button onClick={() => setMonthlyReportModalOpen(false)} variant="secondary" className="px-8 rounded-full font-bold">Close</Button>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default EodReports;
