import React, { useState, useEffect } from 'react';
import api from '../../hr-portal/api/api.js';
import useAuth from '../../hr-portal/hooks/useAuth.jsx';
import StatCard from '../../hr-portal/components/StatCard.jsx';
import AttendanceLog from '../../hr-portal/components/AttendenceLog.jsx';
import Button from '../../hr-portal/components/Button.jsx';
import Modal from '../../hr-portal/components/Modal.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import ThemeToggle from '../../hr-portal/components/ThemeToggle.jsx';
import { useTheme } from '../../hr-portal/context/ThemeContext.jsx';
import MotivationalQuotes from '../../hr-portal/components/MotivationalQuotes.jsx';
import EmployeeLoader from '../../hr-portal/components/EmployeeLoader.jsx';
import Layout from '../../components/Layout';

const AttendanceDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
    const [isCheckOutModalOpen, setCheckOutModalOpen] = useState(false);
    const [isUnpaidLeaveModalOpen, setUnpaidLeaveModalOpen] = useState(false);
    const [eod, setEod] = useState('');
    const [notes, setNotes] = useState('');
    const [requestedLeaveType, setRequestedLeaveType] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const { theme } = useTheme();

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

    useEffect(() => {
        const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        setIsMobile(isMobileUA);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [profileRes, attendanceRes] = await Promise.all([
                api.get('/employee/profile'),
                api.get('/employee/attendance')
            ]);
            setProfile(profileRes.data);
            setAttendance(attendanceRes.data);
            const now = new Date();
            const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const todayString = todayUTC.toISOString().split('T')[0];
            const todayRecord = attendanceRes.data.find(a => a.date.startsWith(todayString));
            setTodayAttendance(todayRecord);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleLeaveRequest = (leaveType) => {
        const requiredLeaves = leaveType === 'Holiday' ? 1 : 0.5;
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
        if (isCheckingIn) return;
        setIsCheckingIn(true);

        try {
            const deviceInfo = navigator.userAgent;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            const { data: newRecord } = await api.post('/employee/attendance', {
                type: 'checkin',
                status,
                notes,
                deviceInfo,
                ipAddress: ip,
                latitude: null,
                longitude: null,
                isTouchDevice
            });

            setCheckInModalOpen(false);
            setNotes('');
            setTodayAttendance(newRecord);

            const { data: updatedProfile } = await api.get('/employee/profile');
            setProfile(updatedProfile);
            setAttendance(prev => [newRecord, ...prev.filter(a => a._id !== newRecord._id)]);
        } catch (error) {
            console.error("Check-in failed:", error);
            alert(error.response?.data?.message || 'Check-in failed');
        } finally {
            setIsCheckingIn(false);
        }
    };

    const proceedWithUnpaidLeave = () => {
        handleCheckIn(requestedLeaveType);
        setUnpaidLeaveModalOpen(false);
    };

    const handleCheckOut = async () => {
        if (!eod.trim()) {
            alert("EOD report is required to check out.");
            return;
        }

        if (isCheckingIn) return;
        setIsCheckingIn(true);

        try {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            const { data: updatedRecord } = await api.post('/employee/attendance', {
                type: 'checkout',
                eod,
                ipAddress: ip,
                latitude: null,
                longitude: null,
                isTouchDevice,
            });

            setCheckOutModalOpen(false);
            setEod('');
            setTodayAttendance(updatedRecord);
            setAttendance(prevAttendance =>
                prevAttendance.map(att => att._id === updatedRecord._id ? updatedRecord : att)
            );
        } catch (error) {
            console.error("Check-out failed:", error);
            alert(error.response?.data?.message || 'Check-out failed');
        } finally {
            setIsCheckingIn(false);
        }
    };

    const isAfterMidday = new Date().getHours() >= 12;

    const monthsList = [
        { value: 'all', label: 'All Months' },
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const filteredAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.getUTCMonth() + 1;
        const recordYear = recordDate.getUTCFullYear();
        const monthMatch = filterMonth === 'all' || recordMonth === parseInt(filterMonth);
        const yearMatch = !filterYear || recordYear === parseInt(filterYear);
        return monthMatch && yearMatch;
    });

    if (isMobile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#fff5e6] dark:bg-gray-900">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm">
                    <div className="text-red-500 text-6xl mb-4 text-center flex justify-center">🚫</div>
                    <h1 className="text-2xl font-bold text-[#433020] mb-4">Access Restricted</h1>
                    <p className="text-[#8a6144]">The Employee Dashboard is restricted on mobile devices.</p>
                </div>
            </div>
        );
    }

    if (loading) return (
        <Layout title="Attendance Dashboard" noPadding={true}>
            <div className="flex justify-center items-center h-full bg-[#fff5e6]">
                <Spinner />
            </div>
        </Layout>
    );

    if (isCheckingIn) return <EmployeeLoader name={profile?.name || user?.name} action={isCheckOutModalOpen ? "checkout" : "checkin"} />;

    const filterClass = "w-full pl-8 pr-5 py-3 border border-gray-200 rounded-xl bg-white focus:ring-4 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all duration-300 shadow-sm font-medium h-[45px] text-sm";

    return (
        <Layout title="Attendance Dashboard" noPadding={true}>
            <div className={`min-h-screen p-4 md:p-6 space-y-6 bg-[#fff5e6] ${theme === 'dark' ? 'dark:bg-gray-900 dark:text-white' : 'text-gray-800'} font-sans`}>
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black text-[#433020] dark:text-white">
                        Welcome, <span className="text-[#8a6144]">{profile?.name || user?.name || 'User'}!</span>
                        {profile?.employeeId && (
                            <span className="text-[#8a6144]/50 text-2xl md:text-3xl font-bold ml-4 italic tracking-tight">
                                ({profile.employeeId})
                            </span>
                        )}
                    </h1>
                    <ThemeToggle />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    <StatCard title="EMPLOYEE ID" value={profile?.employeeId ?? 'N/A'} />
                    <StatCard title="DEPARTMENT" value={profile?.department ?? 'N/A'} />
                    <StatCard title="HOLIDAYS LEFT" value={profile?.holidaysLeft ?? 'N/A'} />
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-[#433020] dark:text-white flex items-center mb-4 border-l-[4px] border-[#86593a] pl-3">
                            Today's Attendance
                        </h3>
                        {todayAttendance ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Status: <span className="font-bold text-green-600 dark:text-green-400 uppercase tracking-tight">{todayAttendance.status}</span></p>
                                <p className="text-sm font-medium">Checked In: <span className="font-bold text-[#433020] dark:text-gray-100">{new Date(todayAttendance.checkIn).toLocaleTimeString()}</span></p>
                                {todayAttendance.notes && <p className="text-sm italic text-gray-500 font-medium">Notes: {todayAttendance.notes}</p>}
                                {todayAttendance.checkOut ? (
                                    <p className="text-sm font-medium">Checked Out: <span className="font-bold text-[#433020] dark:text-gray-100">{new Date(todayAttendance.checkOut).toLocaleTimeString()}</span></p>
                                ) : (
                                    <Button onClick={() => setCheckOutModalOpen(true)} variant="brand" className="mt-4" disabled={isCheckingIn}>Check Out</Button>
                                )}
                            </div>
                        ) : (
                            <Button onClick={() => setCheckInModalOpen(true)} variant="brand" disabled={isCheckingIn}>Check In for Today</Button>
                        )}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
                        <div>
                            <label className="block text-xs font-bold text-[#8a6144] mb-2 font-mono uppercase tracking-widest">Filter by Month</label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className={filterClass + " appearance-none cursor-pointer"}
                            >
                                {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8a6144] mb-2 font-mono uppercase tracking-widest">Filter by Year</label>
                            <input
                                type="number"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className={filterClass + " !pl-8"}
                                placeholder="Year"
                            />
                        </div>
                    </div>
                    <AttendanceLog attendance={filteredAttendance} showHeader={false} />
                </div>

                {/* Modals unchanged in logic */}
                <Modal isOpen={isCheckInModalOpen} onClose={() => setCheckInModalOpen(false)} title="Mark Your Attendance">
                    <div className="space-y-4 p-2">
                        <p className="text-center text-base font-medium">How would you like to mark your attendance?</p>
                        <div className="flex justify-around gap-4">
                            {!isAfterMidday && (
                                <Button onClick={() => handleCheckIn('Present')} disabled={isCheckingIn}>Full Day</Button>
                            )}
                            <Button onClick={() => handleLeaveRequest('Half Day')} variant="secondary" disabled={isCheckingIn}>Half Day</Button>
                        </div>
                        <div className="mt-6">
                            <label className="block text-[10px] font-black text-[#8a6144] mb-2 uppercase tracking-[0.2em] font-mono">Optional Notes</label>
                            <textarea rows="3" className="w-full p-4 border-2 border-[#8a6144]/10 rounded-2xl bg-[#fffcf7]/50 dark:bg-gray-700/50 dark:text-white text-sm focus:ring-4 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all duration-300" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Working from home..." disabled={isCheckingIn} />
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isUnpaidLeaveModalOpen} onClose={() => setUnpaidLeaveModalOpen(false)} title="Confirm Unpaid Leave">
                    <div className="text-center space-y-4 py-2">
                        <p className="text-lg font-bold text-red-600">No paid leaves left.</p>
                        <p className="text-sm text-gray-600">This leave will be marked as unpaid. Proceed?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setUnpaidLeaveModalOpen(false)} className="bg-gray-200 px-6 py-2 rounded-xl font-bold text-sm">Cancel</button>
                            <button onClick={proceedWithUnpaidLeave} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Proceed</button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isCheckOutModalOpen} onClose={() => setCheckOutModalOpen(false)} title="Submit EOD & Check Out">
                    <div className="space-y-3">
                        <label className="block text-xs font-bold text-gray-500">END OF DAY REPORT</label>
                        <textarea rows="4" className="w-full p-3 border rounded-xl bg-gray-50 text-sm" value={eod} onChange={(e) => setEod(e.target.value)} placeholder="Summarize today's work..." />
                        <button onClick={handleCheckOut} className="w-full bg-[#86593a] text-white py-3 rounded-xl font-bold text-sm">Submit and Check Out</button>
                    </div>
                </Modal>
                <div className="max-w-6xl mx-auto"><MotivationalQuotes /></div>
            </div>
        </Layout>
    );
};

export default AttendanceDashboard;
