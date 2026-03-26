import React, { useState, useEffect, useMemo } from 'react';
import api from "../../hr-portal/api/api.js";
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Button from '../../hr-portal/components/Button.jsx';
import { formatDate } from '../../hr-portal/utils/formatDate.js';
import Modal from '../../hr-portal/components/Modal.jsx';
import DeductionLogModal from '../../hr-portal/components/DeductionLogModal.jsx';
import Layout from '../../components/Layout';

const SalaryCalculatorPage = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [pastRecords, setPastRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editedNotes, setEditedNotes] = useState('');

    const [isLogModalOpen, setLogModalOpen] = useState(false);
    const [selectedLogData, setSelectedLogData] = useState(null);

    const [selectedPastRecord, setSelectedPastRecord] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [payrollRes, recordsRes] = await Promise.all([
                api.get(`/hr/payroll?month=${month}&year=${year}`),
                api.get('/hr/salary-records')
            ]);
            setPayrollData(payrollRes.data);
            setPastRecords(recordsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [month, year]);

    const handleSaveRecord = async () => {
        if (!notes.trim()) {
            alert("Please add a note before saving the payroll record.");
            return;
        }
        try {
            await api.post('/hr/salary-records', { month, year, notes, payrollData });
            alert('Salary record saved successfully!');
            setNotes('');
            const { data } = await api.get('/hr/salary-records');
            setPastRecords(data);
        } catch (error) {
            console.error("Failed to save record:", error);
            alert('Failed to save record. Please check the backend logs.');
        }
    };

    const handleEditClick = (record) => {
        setEditingRecord(record);
        setEditedNotes(record.notes);
        setEditModalOpen(true);
    };

    const handleUpdateRecord = async () => {
        if (!editingRecord) return;
        try {
            const { data: updatedRecord } = await api.put(`/hr/salary-records/${editingRecord._id}`, { notes: editedNotes });
            setPastRecords(prev => prev.map(rec => rec._id === updatedRecord._id ? updatedRecord : rec));
            setEditModalOpen(false);
            setEditingRecord(null);
        } catch (error) {
            console.error("Failed to update record:", error);
            alert("Failed to update record.");
        }
    };

    const handleViewLog = (data) => {
        setSelectedLogData(data);
        setLogModalOpen(true);
    };

    if (loading) return (
        <Layout title="Salary Management">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    return (
        <Layout title="Salary Management System">
            <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 md:px-8 transition-colors duration-300">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 mb-12 animate-fade-in-up drop-shadow-sm">
                    Salary <span className="text-[#8a6144]">Management</span>
                </h1>

                {/* Main Payroll Calculator Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-10 rounded-[3rem] shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto">
                    <div className="flex flex-wrap justify-between items-center mb-10 gap-4 sm:gap-8">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black text-[#433020] dark:text-gray-100 flex items-center gap-3">
                                💳 Payroll for
                            </h2>
                            <span className="text-sm font-bold text-[#8a6144] dark:text-gray-400 italic mt-2">
                                {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center bg-[#f5e6d3]/30 dark:bg-gray-700/30 p-4 rounded-3xl border border-[#8a6144]/10 dark:border-gray-600 shadow-inner">
                            <div className="flex items-center gap-3">
                                <label htmlFor="month-select" className="text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em] ml-2">Month:</label>
                                <select
                                    id="month-select"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 font-bold focus:ring-2 focus:ring-[#8a6144] outline-none transition-all shadow-sm"
                                >
                                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em]">Year:</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-[#433020] dark:text-gray-200 font-bold focus:ring-2 focus:ring-[#8a6144] outline-none w-28 transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-[#8a6144]/15 dark:border-gray-700 shadow-inner">
                        <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">Employee</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">Base Salary</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">Unpaid Leaves</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">Late Fine</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">No EOD Fine</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-red-500 uppercase tracking-wider whitespace-nowrap">Total Deductions</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-green-600 uppercase tracking-wider whitespace-nowrap">Net Salary</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-[#8a6144] uppercase tracking-wider whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                                {payrollData.map(data => (
                                    <tr key={data.employeeId} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition-all duration-300 group">
                                        <td className="px-6 py-5 font-black text-[#433020] dark:text-gray-100 group-hover:text-[#8a6144] transition-colors">{data.employeeName}</td>
                                        <td className="px-6 py-5 text-[#6b4d36] dark:text-gray-400 font-bold italic">₹{data.baseSalary.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-600 border border-amber-200/50 rounded-full text-[11px] font-black">{data.unpaidLeaves}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center text-red-500 font-bold">₹{data.lateDeductions.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center text-red-500 font-bold">₹{data.noEodDeductions.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center font-black text-red-600 bg-red-50/20 dark:bg-red-900/5 shadow-inner">₹{data.totalDeductions.toLocaleString()}</td>
                                        <td className="px-6 py-5 font-black text-green-600 bg-green-50/20 dark:bg-green-900/5 shadow-inner">₹{data.netSalary.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center">
                                            <Button onClick={() => handleViewLog(data)} variant="brand" className="text-[9px] py-1.5 px-4 rounded-full uppercase tracking-widest font-black shadow-sm">View Log</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-10 bg-[#fffbf5] dark:bg-gray-700/30 p-4 sm:p-8 rounded-[2.5rem] border border-[#8a6144]/15 dark:border-gray-600 shadow-inner">
                        <div className="flex flex-col mb-4">
                            <h3 className="text-xl font-black text-[#433020] dark:text-gray-100 flex items-center gap-3">
                                📝 Calculation Notes
                            </h3>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="4"
                            className="w-full p-6 bg-white dark:bg-gray-800 border border-[#8a6144]/20 dark:border-gray-700 rounded-[1.5rem] focus:ring-4 focus:ring-[#8a6144]/10 outline-none transition-all text-[#433020] dark:text-gray-200 font-medium placeholder-[#8a6144]/30 shadow-sm"
                            placeholder="e.g., Calculated on 1st of month, includes bonuses..."
                        />
                        <div className="flex justify-center w-full">
                            <Button onClick={handleSaveRecord} variant="brand" className="mt-8 px-12 py-3.5 rounded-full shadow-xl shadow-[#8a6144]/20 text-xs font-black uppercase tracking-[0.2em] transform transition-transform hover:scale-105 active:scale-95">
                                Save Payroll Record
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Past Records Section */}
                <div className="bg-white/90 dark:bg-gray-800/80 p-4 sm:p-10 rounded-[3rem] shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 max-w-7xl mx-auto mt-12 mb-20 animate-fade-in transition-all duration-500">
                    <div className="flex flex-col mb-10 ml-4">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">📂</span>
                            <h2 className="text-2xl font-black text-[#433020] dark:text-gray-100">
                                Saved Payroll
                            </h2>
                        </div>
                        <span className="text-xs font-bold text-gray-400 italic ml-11">
                            History
                        </span>
                    </div>

                    {pastRecords.length > 0 ? (
                        <div className="space-y-6">
                            {pastRecords.map(record => (
                                <div key={record._id} className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md group">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-xl font-black text-[#433020] dark:text-gray-100">
                                                    {new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">
                                                    SAVED ON: {formatDate(record.createdAt)}
                                                </p>
                                            </div>
                                            
                                            <div className="bg-[#f9f9f9] dark:bg-gray-700/50 p-2.5 px-5 rounded-xl border border-gray-200 dark:border-gray-600 inline-block max-w-[200px] sm:max-w-md overflow-x-auto whitespace-nowrap scrollbar-hide">
                                                <p className="text-sm italic text-gray-500 dark:text-gray-400">
                                                    <span className="not-italic mr-2 font-medium">Notes:</span>{record.notes}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <Button 
                                                onClick={() => handleEditClick(record)} 
                                                variant="custom"
                                                className="bg-[#8a6144] hover:bg-[#6b4d36] text-white px-8 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all"
                                            >
                                                Edit Notes
                                            </Button>
                                            <Button
                                                onClick={() => setSelectedPastRecord(selectedPastRecord?._id === record._id ? null : record)}
                                                variant="custom"
                                                className={`px-8 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all bg-blue-600 hover:bg-blue-700 text-white`}
                                            >
                                                {selectedPastRecord?._id === record._id ? 'Hide Details' : 'View Details'}
                                            </Button>
                                        </div>
                                    </div>
                                    {selectedPastRecord?._id === record._id && (
                                        <div className="mt-8 overflow-x-auto rounded-[2rem] border border-[#8a6144]/10 dark:border-gray-700 animate-slide-in-down shadow-inner bg-[#fffbf5]/50 dark:bg-gray-900/30">
                                            <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                                                <thead className="bg-[#f5e6d3]/30 dark:bg-gray-700/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-[10px] font-black text-[#8a6144] uppercase tracking-widest">Employee</th>
                                                        <th className="px-6 py-4 text-right text-[10px] font-black text-[#8a6144] uppercase tracking-widest">Net Paid</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#8a6144]/5 dark:divide-gray-700/30">
                                                    {record.payrollData.map(data => (
                                                        <tr key={data.employeeId} className="hover:bg-[#fffbf5] transition-colors">
                                                            <td className="px-6 py-4 text-sm font-black text-[#433020] dark:text-gray-100">{data.employeeName}</td>
                                                            <td className="px-6 py-4 text-sm font-black text-green-600 text-right">₹{data.netSalary.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white/40 dark:bg-gray-800/40 rounded-[3rem] border border-dashed border-[#8a6144]/20 shadow-inner">
                            <p className="text-[#8a6144] dark:text-gray-500 font-black uppercase tracking-[0.2em] italic">No archived financial records found.</p>
                        </div>
                    )}
                </div>
            </div>

            <DeductionLogModal
                isOpen={isLogModalOpen}
                onClose={() => setLogModalOpen(false)}
                logData={selectedLogData}
            />

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Update Archive Notes">
                <div className="space-y-6 py-2">
                    <p className="text-[10px] font-black text-[#8a6144] uppercase tracking-[0.2em] ml-1">Editing Archive: {editingRecord ? new Date(editingRecord.year, editingRecord.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}</p>
                    <textarea
                        value={editedNotes}
                        onChange={(e) => setEditedNotes(e.target.value)}
                        rows="6"
                        className="w-full p-6 bg-white dark:bg-gray-800 border border-[#8a6144]/20 dark:border-gray-700 rounded-3xl focus:ring-4 focus:ring-[#8a6144]/10 outline-none transition-all text-[#433020] dark:text-gray-200 font-medium shadow-inner"
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#8a6144]/10 dark:border-gray-700">
                        <Button onClick={() => setEditModalOpen(false)} variant="secondary" className="px-8 rounded-full font-black uppercase tracking-widest text-[10px]">Back</Button>
                        <Button onClick={handleUpdateRecord} variant="brand" className="px-10 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg">Save Update</Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default SalaryCalculatorPage;
