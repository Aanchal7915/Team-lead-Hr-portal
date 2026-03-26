import React, { useState, useEffect, useMemo } from 'react';
import api from '../../hr-portal/api/api.js';
import EmployeeTable from '../../hr-portal/components/EmployeeTable.jsx';
import AttendanceLog from '../../hr-portal/components/AttendenceLog.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import HREmployeeDetails from "../../hr-portal/components/HREmployeeDetails.jsx";
import StatCard from '../../hr-portal/components/StatCard.jsx';
import EditAttendanceModal from '../../hr-portal/components/EditAttendanceModal.jsx';
import Modal from '../../hr-portal/components/Modal.jsx';
import { useTheme } from '../../hr-portal/context/ThemeContext.jsx';
import MotivationalQuotes from '../../hr-portal/components/MotivationalQuotes.jsx';
import Layout from '../../components/Layout';
import Button from '../../hr-portal/components/Button.jsx';

const AdminOverview = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isNotMarkedModalOpen, setNotMarkedModalOpen] = useState(false);
    const [isOnLeaveModalOpen, setOnLeaveModalOpen] = useState(false);
    const [isAllEmployeesModalOpen, setAllEmployeesModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empRes, attRes] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/hr/attendance')
            ]);
            setEmployees(empRes.data);
            setAttendance(attRes.data);
        } catch (error) {
            console.error("Failed to fetch HR data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const todayStats = useMemo(() => {
        const todayString = new Date().toISOString().split('T')[0];
        const todaysRecords = attendance.filter(a => a.date.startsWith(todayString));

        const totalEmployees = employees.length;
        const presentToday = todaysRecords.filter(a => a.status === 'Present').length;

        const onLeaveTodayList = todaysRecords.filter(a => a.status === 'Holiday' || a.status === 'Half Day');
        const onLeaveToday = onLeaveTodayList.length;

        const employeesWithRecordIds = new Set(todaysRecords.map(a => a.employeeId?._id?.toString() || a.employeeId?.toString()));
        const notMarkedTodayList = employees.filter(emp => !employeesWithRecordIds.has(emp._id.toString()));
        const notMarkedToday = notMarkedTodayList.length;

        return { totalEmployees, presentToday, onLeaveToday, notMarkedToday, onLeaveTodayList, notMarkedTodayList };
    }, [employees, attendance]);

    const filteredAttendance = useMemo(() => {
        return attendance
            .filter(record => (record.date || '').startsWith(filterDate))
            .sort((a, b) => (a.employeeId?.name || '').localeCompare(b.employeeId?.name || ''));
    }, [attendance, filterDate]);

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    };

    if (loading) return (
        <Layout title="HR Admin Overview" noPadding={true}>
            <div className="flex justify-center items-center h-full bg-[#fff5e6]">
                <Spinner />
            </div>
        </Layout>
    );

    const filterClass = "w-full pl-8 pr-5 py-2 border border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all duration-300 shadow-sm font-medium h-[45px] text-sm";

    return (
        <Layout title="HR Admin Overview" noPadding={true}>
            <div className={`min-h-screen p-4 md:p-6 space-y-6 bg-[#fff5e6] ${theme === 'dark' ? 'dark:bg-gray-900 dark:text-white' : 'text-gray-800'} font-sans`}>
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-3xl font-black text-[#433020] dark:text-white">
                        <span className="text-[#8a6144]">HR Admin</span> Dashboard
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    <div onClick={() => setAllEmployeesModalOpen(true)} className="cursor-pointer">
                        <StatCard title="TOTAL EMPLOYEES" value={todayStats.totalEmployees} />
                    </div>
                    <StatCard title="PRESENT TODAY" value={todayStats.presentToday} colorClass="text-green-500" />
                    <div onClick={() => setOnLeaveModalOpen(true)} className="cursor-pointer">
                        <StatCard title="ON LEAVE TODAY" value={todayStats.onLeaveToday} colorClass="text-blue-500" />
                    </div>
                    <div onClick={() => setNotMarkedModalOpen(true)} className="cursor-pointer">
                        <StatCard title="NOT MARKED TODAY" value={todayStats.notMarkedToday} colorClass="text-red-500" />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2 border-l-[4px] border-[#86593a] pl-3">
                            Daily Attendance Log
                        </h2>
                        <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
                            <label className="text-xs font-bold text-[#8a6144] font-mono uppercase tracking-widest whitespace-nowrap">Filter by Date</label>
                            <input 
                                type="date" 
                                value={filterDate} 
                                onChange={(e) => setFilterDate(e.target.value)} 
                                className={filterClass + " w-48"}
                            />
                        </div>
                    </div>
                    <AttendanceLog attendance={filteredAttendance} onEdit={handleEditClick} showHeader={false} />
                </div>

                {selectedRecord && (
                    <EditAttendanceModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} record={selectedRecord} onUpdate={fetchData} />
                )}

                <Modal isOpen={isNotMarkedModalOpen} onClose={() => setNotMarkedModalOpen(false)} title="Attendance Outstanding">
                    <ul className="divide-y divide-gray-100">
                        {todayStats.notMarkedTodayList.length > 0 ? todayStats.notMarkedTodayList.map(emp => (
                            <li key={emp._id} className="py-2">
                                <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                                <p className="text-xs text-gray-500 font-medium">{emp.email}</p>
                            </li>
                        )) : <li className="py-2 text-gray-400 text-sm">All entries complete!</li>}
                    </ul>
                </Modal>

                <Modal isOpen={isOnLeaveModalOpen} onClose={() => setOnLeaveModalOpen(false)} title="Teams on Leave Today">
                    <ul className="divide-y divide-gray-100">
                        {todayStats.onLeaveTodayList.length > 0 ? todayStats.onLeaveTodayList.map(rec => (
                            <li key={rec._id} className="py-2">
                                <p className="font-bold text-gray-800 text-sm">{rec.employeeId?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-500 font-medium">{rec.employeeId?.email || 'N/A'}</p>
                            </li>
                        )) : <li className="py-2 text-gray-400 text-sm">No active leaves today.</li>}
                    </ul>
                </Modal>

                <Modal isOpen={isAllEmployeesModalOpen} onClose={() => setAllEmployeesModalOpen(false)} title="Employee Directory">
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-[#FEFAF4]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8D6449] uppercase tracking-widest">ID</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8D6449] uppercase tracking-widest">NAME</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-[#8D6449] uppercase tracking-widest">DEPT</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {employees.map(emp => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-bold">{emp.employeeId}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-black text-gray-900">{emp.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 font-semibold">{emp.department}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
                <div className="max-w-6xl mx-auto"><MotivationalQuotes /></div>
            </div>
        </Layout>
    );
};

export default AdminOverview;
