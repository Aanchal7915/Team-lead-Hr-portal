

import React, { useState, useEffect, useMemo } from 'react';
import api from "../api/api.js";
import useAuth from '../hooks/useAuth.jsx';
import EmployeeTable from '../components/EmployeeTable.jsx';
import AttendanceLog from '../components/AttendenceLog.jsx';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';
import HREmployeeDetails from "../components/HREmployeeDetails.jsx";
import StatCard from '../components/StatCard.jsx';
import EditAttendanceModal from '../components/EditAttendanceModal.jsx';
import Modal from '../components/Modal.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';
import MotivationalQuotes from '../components/MotivationalQuotes.jsx';
import EmployeeLoader from '../components/EmployeeLoader.jsx';

const HRDashboard = () => {
    const { user } = useAuth();
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

    // Personal Attendance State (Added)
    const [profile, setProfile] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
    const [isCheckOutModalOpen, setCheckOutModalOpen] = useState(false);
    const [isUnpaidLeaveModalOpen, setUnpaidLeaveModalOpen] = useState(false);
    const [eod, setEod] = useState('');
    const [notes, setNotes] = useState('');
    const [requestedLeaveType, setRequestedLeaveType] = useState(null);
    const [ip, setIp] = useState("");
    const [isCheckingIn, setIsCheckingIn] = useState(false);

    useEffect(() => {
        const getIp = async () => {
            try {
                const res = await fetch("https://api.ipify.org?format=json");
                const data = await res.json();
                setIp(data.ip);
            } catch (err) {
                console.error("Failed to fetch IP:", err);
            }
        };
        getIp();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empRes, attRes, profileRes, personalAttRes] = await Promise.all([
                api.get('/hr/employees'),
                api.get('/hr/attendance'),
                api.get('/employee/profile'),
                api.get('/employee/attendance')
            ]);
            setEmployees(empRes.data);
            setAttendance(attRes.data);
            setProfile(profileRes.data);
            
            const now = new Date();
            const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const todayString = todayUTC.toISOString().split('T')[0];
            const personalTodayRecord = personalAttRes.data.find(a => a.date.startsWith(todayString));
            setTodayAttendance(personalTodayRecord);
        } catch (error) {
            console.error("Failed to fetch HR data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveRequest = (leaveType) => {
        const requiredLeaves = leaveType === 'Holiday' ? 1 : 0.5;
        // Skip leave check for HR users as they don't have a fixed balance
        const isHR = profile?.role === 'hr' || user?.role === 'hr';
        if (!isHR && profile?.holidaysLeft < requiredLeaves) {
            setRequestedLeaveType(leaveType);
            setCheckInModalOpen(false);
            setUnpaidLeaveModalOpen(true);
        } else {
            handleCheckIn(leaveType);
        }
    };

    const handleCheckIn = async (status) => {
        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported in this browser!");
            return;
        }

        if (isCheckingIn) return;
        setIsCheckingIn(true);

        const geoTimeout = setTimeout(() => {
            if (isCheckingIn) {
                alert("Location request timed out. Please refresh and try again or ensure location permissions are granted.");
                setIsCheckingIn(false);
            }
        }, 10000); // 10 second timeout

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                clearTimeout(geoTimeout);
                try {
                    const { latitude, longitude } = pos.coords;
                    const deviceInfo = navigator.userAgent;
                    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

                    const { data: newRecord } = await api.post('/employee/attendance', {
                        type: 'checkin',
                        status,
                        notes,
                        deviceInfo,
                        ipAddress: ip,
                        latitude,
                        longitude,
                        isTouchDevice
                    });

                    setCheckInModalOpen(false);
                    setNotes('');
                    setTodayAttendance(newRecord);

                    const { data: updatedProfile } = await api.get('/employee/profile');
                    setProfile(updatedProfile);
                    // Refresh logs
                    fetchData();
                } catch (error) {
                    console.error("Check-in failed:", error);
                    alert(error.response?.data?.message || 'Check-in failed');
                } finally {
                    setIsCheckingIn(false);
                }
            },
            (err) => {
                alert("⚠️ Location access is required for attendance!");
                console.error("GPS Error:", err);
                setIsCheckingIn(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const proceedWithUnpaidLeave = () => {
        handleCheckIn(requestedLeaveType);
        setUnpaidLeaveModalOpen(false);
    };

    const handleCheckOut = () => {
        if (!eod.trim()) {
            alert("EOD report is required to check out.");
            return;
        }

        if (!("geolocation" in navigator)) {
            alert("Geolocation is not supported in this browser!");
            return;
        }

        if (isCheckingIn) return;
        setIsCheckingIn(true);

        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;

                    const { data: updatedRecord } = await api.post('/employee/attendance', {
                        type: 'checkout',
                        eod,
                        ipAddress: ip,
                        latitude,
                        longitude,
                        isTouchDevice,
                    });

                    setCheckOutModalOpen(false);
                    setEod('');
                    setTodayAttendance(updatedRecord);
                    // Refresh logs
                    fetchData();
                } catch (error) {
                    console.error("Check-out failed:", error);
                    alert(error.response?.data?.message || 'Check-out failed');
                } finally {
                    setIsCheckingIn(false);
                }
            },
            (err) => {
                alert("⚠️ Location access is required for checkout!");
                console.error("GPS Error:", err);
                setIsCheckingIn(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const isAfterMidday = new Date().getHours() >= 12;

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

        const employeesWithRecordIds = new Set(todaysRecords.map(a => a.employeeId._id.toString()));
        const notMarkedTodayList = employees.filter(emp => !employeesWithRecordIds.has(emp._id.toString()));
        const notMarkedToday = notMarkedTodayList.length;

        return { totalEmployees, presentToday, onLeaveToday, notMarkedToday, onLeaveTodayList, notMarkedTodayList };
    }, [employees, attendance]);

    const filteredAttendance = useMemo(() => {
        return attendance
            .filter(record => record.date.startsWith(filterDate))
            .sort((a, b) => a.employeeId.name.localeCompare(b.employeeId.name));
    }, [attendance, filterDate]);

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setEditModalOpen(true);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    if (isCheckingIn) {
        return <EmployeeLoader name={profile?.name || user?.name} action={isCheckOutModalOpen ? "checkout" : "checkin"} />;
    }

    return (
        <div className="min-h-screen px-4 md:px-8 py-6 bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-[#433020] dark:text-white drop-shadow-sm tracking-tight">
                    <span className="text-[#8a6144]">HR Admin</span> Dashboard
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setAllEmployeesModalOpen(true)} className="cursor-pointer"><StatCard title="Total Employees" value={todayStats.totalEmployees} /></div>
                <StatCard title="Present Today" value={todayStats.presentToday} colorClass="text-green-500" />
                <div onClick={() => setOnLeaveModalOpen(true)} className="cursor-pointer"><StatCard title="On Leave Today" value={todayStats.onLeaveToday} colorClass="text-blue-500" /></div>
                <div onClick={() => setNotMarkedModalOpen(true)} className="cursor-pointer"><StatCard title="Not Marked Today" value={todayStats.notMarkedToday} colorClass="text-red-500" /></div>
            </div>

            <div className="grid grid-cols-1">
                <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 dark:text-white p-8 rounded-3xl shadow-xl shadow-[#433020]/5 border border-white/50 mt-8 transition-all hover:shadow-2xl hover:shadow-[#433020]/10">
                    <h3 className="text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2 mb-6">
                        <span className="w-2 h-8 bg-[#8a6144] rounded-full inline-block"></span>
                        Today's Attendance
                    </h3>
                    {todayAttendance ? (
                        <div className="space-y-2">
                            <p>Status: <span className="font-bold text-green-600 dark:text-green-400">{todayAttendance.status}</span></p>
                            <p>Checked In: <span className="font-bold">{new Date(todayAttendance.checkIn).toLocaleTimeString()}</span></p>
                            {todayAttendance.notes && <p>Notes: <span className="italic text-gray-600 dark:text-gray-300">{todayAttendance.notes}</span></p>}
                            {todayAttendance.checkOut ? (
                                <p>Checked Out: <span className="font-bold">{new Date(todayAttendance.checkOut).toLocaleTimeString()}</span></p>
                            ) : (
                                <Button onClick={() => setCheckOutModalOpen(true)} variant="brand" className="mt-2" disabled={isCheckingIn}>Check Out</Button>
                            )}
                        </div>
                    ) : (
                        <Button onClick={() => setCheckInModalOpen(true)} variant="brand" disabled={isCheckingIn}>Check In for Today</Button>
                    )}
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 dark:text-white p-5 md:p-8 rounded-3xl shadow-xl shadow-[#433020]/5 border border-white/50 mt-8 transition-all hover:shadow-2xl hover:shadow-[#433020]/10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                        <span className="w-1.5 h-8 bg-[#8a6144] rounded-full inline-block"></span>
                        Daily Attendance Log
                    </h2>
                    <div className="mt-4 sm:mt-0">
                        <label htmlFor="filterDate" className="mr-2 text-sm font-medium">Filter by Date:</label>
                        <input type="date" id="filterDate" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-black dark:text-white" />
                    </div>
                </div>
                <AttendanceLog attendance={filteredAttendance} onEdit={handleEditClick} />
            </div>

            {selectedRecord && (
                <EditAttendanceModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} record={selectedRecord} onUpdate={fetchData} />
            )}

            <Modal isOpen={isNotMarkedModalOpen} onClose={() => setNotMarkedModalOpen(false)} title="Employees Who Haven't Marked Attendance Today">
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {todayStats.notMarkedTodayList.length > 0 ? todayStats.notMarkedTodayList.map(emp => (
                        <li key={emp._id} className="py-3">
                            <p className="font-medium text-gray-800 dark:text-white">{emp.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{emp.email}</p>
                        </li>
                    )) : <p className="text-gray-500 dark:text-gray-400">All employees have marked their attendance.</p>}
                </ul>
            </Modal>

            <Modal isOpen={isOnLeaveModalOpen} onClose={() => setOnLeaveModalOpen(false)} title="Employees on Leave Today">
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                    {todayStats.onLeaveTodayList.length > 0 ? todayStats.onLeaveTodayList.map(rec => (
                        <li key={rec._id} className="py-3">
                            <p className="font-medium text-gray-800 dark:text-white">{rec.employeeId.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{rec.employeeId.email}</p>
                        </li>
                    )) : <p className="text-gray-500 dark:text-gray-400">No employees are on leave today.</p>}
                </ul>
            </Modal>

            <Modal isOpen={isAllEmployeesModalOpen} onClose={() => setAllEmployeesModalOpen(false)} title="All Employee Data">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Employee ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {employees.map(emp => (
                                <tr key={emp._id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.employeeId}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{emp.department}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>

            {/* Attendance Modals (Added) */}
            <Modal isOpen={isCheckInModalOpen} onClose={() => setCheckInModalOpen(false)} title="Mark Your Attendance">
                <div className="space-y-4">
                    <p>How would you like to mark your attendance?</p>
                    <div className="flex justify-around">
                        {!isAfterMidday && (
                            <Button onClick={() => handleCheckIn('Present')} disabled={isCheckingIn}>Full Day</Button>
                        )}
                        <Button onClick={() => handleLeaveRequest('Half Day')} variant="secondary" disabled={isCheckingIn}>Half Day</Button>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">Optional Notes</label>
                        <textarea id="notes" rows="3" className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Working from home..." disabled={isCheckingIn} />
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isUnpaidLeaveModalOpen} onClose={() => setUnpaidLeaveModalOpen(false)} title="Confirm Unpaid Leave">
                <div className="text-center space-y-4">
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">No paid leaves left.</p>
                    <p>This leave will be marked as unpaid. Proceed?</p>
                    <div className="flex justify-center space-x-4 pt-4">
                        <Button onClick={() => setUnpaidLeaveModalOpen(false)} variant="secondary" disabled={isCheckingIn}>Cancel</Button>
                        <Button onClick={proceedWithUnpaidLeave} variant="danger" disabled={isCheckingIn}>Proceed</Button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isCheckOutModalOpen} onClose={() => setCheckOutModalOpen(false)} title="Submit EOD & Check Out">
                <div>
                    <label htmlFor="eod" className="block text-sm font-medium mb-2">End of Day Report</label>
                    <textarea
                        id="eod"
                        rows="4"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={eod}
                        onChange={(e) => setEod(e.target.value)}
                        placeholder="Summarize today's work..."
                        disabled={isCheckingIn}
                    ></textarea>
                    <Button onClick={handleCheckOut} className="w-full mt-4" disabled={isCheckingIn}>Submit EOD and Check Out</Button>
                </div>
            </Modal>

            <div className="w-full overflow-x-auto">
                <MotivationalQuotes />
            </div>

        </div>
    );
};

export default HRDashboard;
