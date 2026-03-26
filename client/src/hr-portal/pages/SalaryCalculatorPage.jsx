

// // src/pages/hr/SalaryCalculatorPage.js
// import React, { useState, useEffect, useMemo } from 'react';
// import api from "../api/api.js";
// import Spinner from '../components/Spinner.jsx';
// import Button from '../components/Button.jsx';
// import { formatDate } from '../utils/formatDate.js';
// import Modal from '../components/Modal.jsx';
// import DeductionLogModal from '../components/DeductionLogModal.jsx';

// const SalaryCalculatorPage = () => {
//     const [payrollData, setPayrollData] = useState([]);
//     const [pastRecords, setPastRecords] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [notes, setNotes] = useState('');
//     const [month, setMonth] = useState(new Date().getMonth() + 1);
//     const [year, setYear] = useState(new Date().getFullYear());

//     const [isEditModalOpen, setEditModalOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState(null);
//     const [editedNotes, setEditedNotes] = useState('');

//     // --- FIX: Add missing state for the deduction log modal ---
//     const [isLogModalOpen, setLogModalOpen] = useState(false);
//     const [selectedLogData, setSelectedLogData] = useState(null);

//     const [selectedPastRecord, setSelectedPastRecord] = useState(null);

//     const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
//     const [filterYear, setFilterYear] = useState(new Date().getFullYear());

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const [payrollRes, recordsRes] = await Promise.all([
//                     api.get(`/hr/payroll?month=${month}&year=${year}`),
//                     api.get('/hr/salary-records')
//                 ]);
//                 setPayrollData(payrollRes.data);
//                 setPastRecords(recordsRes.data);
//             } catch (error) {
//                 console.error("Failed to fetch data", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [month, year]);

//     const filteredPastRecords = useMemo(() => {
//         return pastRecords.filter(rec => rec.month === parseInt(filterMonth) && rec.year === parseInt(filterYear));
//     }, [pastRecords, filterMonth, filterYear]);

//     const handleSaveRecord = async () => {
//         if (!notes.trim()) {
//             alert("Please add a note before saving the payroll record.");
//             return;
//         }
//         try {
//             await api.post('/hr/salary-records', { month, year, notes, payrollData });
//             alert('Salary record saved successfully!');
//             setNotes('');
//             const { data } = await api.get('/hr/salary-records');
//             setPastRecords(data);
//         } catch (error) {
//             console.error("Failed to save record:", error);
//             alert('Failed to save record. Please check the backend logs.');
//         }
//     };

//     const handleEditClick = (record) => {
//         setEditingRecord(record);
//         setEditedNotes(record.notes);
//         setEditModalOpen(true);
//     };

//     const handleUpdateRecord = async () => {
//         if (!editingRecord) return;
//         try {
//             const { data: updatedRecord } = await api.put(`/hr/salary-records/${editingRecord._id}`, { notes: editedNotes });
//             setPastRecords(prev => prev.map(rec => rec._id === updatedRecord._id ? updatedRecord : rec));
//             setEditModalOpen(false);
//             setEditingRecord(null);
//         } catch (error) {
//             console.error("Failed to update record:", error);
//             alert("Failed to update record.");
//         }
//     };

//     const handleViewLog = (data) => {
//         setSelectedLogData(data);
//         setLogModalOpen(true);
//     };

//     if (loading) return <div className="flex justify-center items-center h-64 animate-pulse"><Spinner /></div>;

//     return (
//         <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen animate-fadeIn">
//             <h1 className="text-4xl font-bold text-gray-900 mb-6 animate-slideIn">Salary Management</h1>

//             <div className="bg-white p-6 rounded-xl shadow-lg">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-4">Calculate Payroll - {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}</h2>
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-blue-100">
//                             <tr>
//                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Employee</th>
//                                 <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Base Salary</th>
//                                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Unpaid Leaves</th>
//                                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Late Fine</th>
//                                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">No EOD Fine</th>
//                                 <th className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase">Total Deductions</th>
//                                 <th className="px-4 py-3 text-left text-xs font-bold text-green-700 uppercase">Net Salary</th>
//                                 <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                             {payrollData.map(data => (
//                                 <tr key={data.employeeId} className="hover:bg-gray-50">
//                                     <td className="px-4 py-4 font-medium">{data.employeeName}</td>
//                                     <td className="px-4 py-4">₹{data.baseSalary.toLocaleString()}</td>
//                                     <td className="px-4 py-4 text-center">{data.unpaidLeaves}</td>
//                                     <td className="px-4 py-4 text-center">₹{data.lateDeductions.toLocaleString()}</td>
//                                     <td className="px-4 py-4 text-center">₹{data.noEodDeductions.toLocaleString()}</td>
//                                     <td className="px-4 py-4 text-center font-bold text-red-600">₹{data.totalDeductions.toLocaleString()}</td>
//                                     <td className="px-4 py-4 font-bold text-green-600">₹{data.netSalary.toLocaleString()}</td>
//                                     <td className="px-4 py-4 text-center">
//                                         <Button onClick={() => handleViewLog(data)} variant="secondary" className="text-xs py-1 px-2">View Log</Button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//                 <div className="mt-6">
//                     <h3 className="text-lg font-semibold mb-2">Payroll Notes</h3>
//                     <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="4" className="w-full p-3 border border-gray-300 rounded-md" placeholder="e.g., Salaries credited on..."/>
//                     <Button onClick={handleSaveRecord} className="mt-4">Save Payroll Record</Button>
//                 </div>
//             </div>

//             {/* Past Records Section */}
//             <div className="bg-white p-6 rounded-xl shadow-lg">
//                 <div className="flex flex-wrap justify-between items-center mb-4">
//                     <h2 className="text-2xl font-semibold text-gray-800">Past Payroll Records</h2>
//                     <div className="flex gap-4 items-center">
//                         <label htmlFor="month-select" className="text-sm font-medium">Month:</label>
//                         <select id="month-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="p-2 border border-gray-300 rounded-md">
//                             {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
//                         </select>
//                         <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border border-gray-300 rounded-md w-24" />
//                     </div>
//                 </div>
//                 {filteredPastRecords.length > 0 ? filteredPastRecords.map(record => (
//                     <div key={record._id} className="border border-gray-200 p-4 rounded-md mb-4">
//                         <div className="flex justify-between items-start">
//                             <div>
//                                 <h3 className="font-bold text-lg">{new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
//                                 <p className="text-sm text-gray-500">Saved on: {formatDate(record.createdAt)}</p>
//                                 <p className="text-sm italic text-gray-600 mt-1">Notes: {record.notes}</p>
//                             </div>
//                             <div>
//                                 <Button onClick={() => handleEditClick(record)} variant="secondary" className="mr-2">Edit Notes</Button>
//                                 <Button onClick={() => setSelectedPastRecord(selectedPastRecord?._id === record._id ? null : record)}>
//                                     {selectedPastRecord?._id === record._id ? 'Hide Details' : 'View Details'}
//                                 </Button>
//                             </div>
//                         </div>
//                         {selectedPastRecord?._id === record._id && (
//                             <div className="mt-4 overflow-x-auto">
//                                 <table className="min-w-full divide-y divide-gray-200">
//                                     <thead className="bg-gray-100">
//                                         <tr>
//                                             <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Employee</th>
//                                             <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Net Salary</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="bg-white divide-y divide-gray-200">
//                                         {record.payrollData.map(data => (
//                                             <tr key={data.employeeId}>
//                                                 <td className="px-4 py-2">{data.employeeName}</td>
//                                                 <td className="px-4 py-2">₹{data.netSalary.toLocaleString()}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 )) : <p className="text-gray-500">No records found for the selected month and year.</p>}
//             </div>

//             <DeductionLogModal 
//                 isOpen={isLogModalOpen}
//                 onClose={() => setLogModalOpen(false)}
//                 logData={selectedLogData}
//             />

//             <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Payroll Notes">
//                 <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} rows="5" className="w-full p-3 border border-gray-300 rounded-md"/>
//                 <div className="flex justify-end space-x-2 mt-4">
//                     <Button onClick={() => setEditModalOpen(false)} variant="secondary">Cancel</Button>
//                     <Button onClick={handleUpdateRecord}>Save Changes</Button>
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default SalaryCalculatorPage;

// src/pages/hr/SalaryCalculatorPage.js
import React, { useState, useEffect, useMemo } from 'react';
import api from "../api/api.js";
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';
import { formatDate } from '../utils/formatDate.js';
import Modal from '../components/Modal.jsx';
import DeductionLogModal from '../components/DeductionLogModal.jsx';

const SalaryCalculatorPage = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [pastRecords, setPastRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    // State for the main calculator's selected month and year
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // State for the edit modal
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editedNotes, setEditedNotes] = useState('');

    // State for the deduction log modal
    const [isLogModalOpen, setLogModalOpen] = useState(false);
    const [selectedLogData, setSelectedLogData] = useState(null);

    // State for showing details of a past record
    const [selectedPastRecord, setSelectedPastRecord] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch the calculated payroll for the selected month and all past saved records
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
        fetchData();
    }, [month, year]); // Re-fetch whenever the selected month or year changes

    const handleSaveRecord = async () => {
        if (!notes.trim()) {
            alert("Please add a note before saving the payroll record.");
            return;
        }
        try {
            // Save the currently displayed payroll data
            await api.post('/hr/salary-records', { month, year, notes, payrollData });
            alert('Salary record saved successfully!');
            setNotes('');
            // Refresh the list of past records
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
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-10 transition-colors duration-300">
            <h1 className="text-2xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 animate-fade-in-up drop-shadow-sm flex items-center justify-center gap-3">
                <span className="text-[#8a6144]">Salary</span> Management
            </h1>

            {/* Main Payroll Calculator Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto">
                <div className="flex flex-wrap justify-between items-center mb-8 gap-6">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                            💳 Payroll for
                        </h2>
                        <span className="text-sm font-normal text-[#8a6144] dark:text-gray-400 italic mt-1">
                            {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                        </span>
                    </div>
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Base Salary</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Unpaid Leaves</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Late Fine</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">No EOD Fine</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-red-500 uppercase tracking-wider">Total Deductions</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-green-600 uppercase tracking-wider">Net Salary</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                            {payrollData.map(data => (
                                <tr key={data.employeeId} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition duration-200">
                                    <td className="px-6 py-4 font-bold text-[#433020] dark:text-gray-100">{data.employeeName}</td>
                                    <td className="px-6 py-4 text-[#6b4d36] dark:text-gray-400 font-medium">₹{data.baseSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">{data.unpaidLeaves}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-red-500 font-medium">₹{data.lateDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center text-red-500 font-medium">₹{data.noEodDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center font-bold text-red-600 bg-red-50/50 dark:bg-red-900/10">₹{data.totalDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-extrabold text-green-600 bg-green-50/50 dark:bg-green-900/10">₹{data.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <Button onClick={() => handleViewLog(data)} variant="brand" className="text-[10px] py-1 px-3 rounded-full uppercase tracking-tighter">View Log</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-8 bg-[#fffbf5] dark:bg-gray-700/30 p-6 rounded-2xl border border-[#8a6144]/15 dark:border-gray-600">
                    <div className="flex flex-col mb-4">
                        <h3 className="text-lg font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                            📝 Payroll Notes
                        </h3>
                        <span className="text-sm font-normal text-[#8a6144] italic mt-1">
                            for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })}
                        </span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="4"
                        className="w-full p-4 bg-white dark:bg-gray-800 border border-[#8a6144]/20 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8a6144] outline-none transition-all text-[#433020] dark:text-gray-200 placeholder-[#8a6144]/40"
                        placeholder="e.g., Salaries credited on..."
                    />
                    <div className="flex justify-center w-full">
                        <Button onClick={handleSaveRecord} variant="brand" className="mt-6 w-full md:w-auto px-10 py-2.5 rounded-full shadow-lg text-sm font-bold uppercase tracking-wider">
                            Save Payroll Record
                        </Button>
                    </div>
                </div>
            </div>

            {/* Past Records Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto">
                <div className="flex flex-col mb-6">
                    <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
                        📂 Saved Payroll
                    </h2>
                    <span className="text-sm font-normal text-[#8a6144] italic mt-1">
                        History
                    </span>
                </div>
                {pastRecords.length > 0 ? (
                    <div className="space-y-4">
                        {pastRecords.map(record => (
                            <div key={record._id} className="bg-[#fffbf5] dark:bg-gray-700/40 p-5 rounded-2xl border border-[#8a6144]/15 dark:border-gray-600 transition-all hover:shadow-md">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-extrabold text-[#433020] dark:text-gray-100 text-lg">
                                            {new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </h3>
                                        <p className="text-[11px] font-bold text-[#8a6144] dark:text-gray-400 uppercase tracking-tighter mt-1">
                                            Saved on: {formatDate(record.createdAt)}
                                        </p>
                                        <p className="text-sm italic text-[#6b4d36] dark:text-gray-300 mt-2 bg-white/40 dark:bg-gray-800/40 p-2 rounded-lg border border-[#8a6144]/5">
                                            Notes: {record.notes}
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={() => handleEditClick(record)} variant="brand" className="text-xs font-bold px-6 rounded-full border-2 border-[#b8866f] shadow-md">Edit Notes</Button>
                                        <Button
                                            onClick={() => setSelectedPastRecord(selectedPastRecord?._id === record._id ? null : record)}
                                            className={`${selectedPastRecord?._id === record._id ? 'bg-[#433020] hover:bg-[#2a1d13]' : 'bg-[#8a6144] hover:bg-[#6b4d36]'} text-white text-xs font-bold px-6 py-2 rounded-full shadow-md transition-all duration-300`}
                                        >
                                            {selectedPastRecord?._id === record._id ? 'Hide Details' : 'View Details'}
                                        </Button>
                                    </div>
                                </div>
                                {selectedPastRecord?._id === record._id && (
                                    <div className="mt-6 overflow-x-auto rounded-xl border border-[#8a6144]/10 dark:border-gray-700 animate-fade-in">
                                        <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                                            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Net Salary</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-[#8a6144]/5 dark:divide-gray-700/30">
                                                {record.payrollData.map(data => (
                                                    <tr key={data.employeeId}>
                                                        <td className="px-4 py-3 text-sm font-bold text-[#433020] dark:text-gray-100">{data.employeeName}</td>
                                                        <td className="px-4 py-3 text-sm font-extrabold text-green-600">₹{data.netSalary.toLocaleString()}</td>
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
                    <p className="text-[#8a6144] dark:text-gray-500 italic mt-4 text-center py-10 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-dashed border-[#8a6144]/20">No payroll records have been saved yet.</p>
                )}
            </div>

            <DeductionLogModal
                isOpen={isLogModalOpen}
                onClose={() => setLogModalOpen(false)}
                logData={selectedLogData}
            />

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Payroll Notes">
                <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows="5"
                    className="w-full p-4 bg-white dark:bg-gray-800 border border-[#8a6144]/20 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#8a6144] outline-none transition-all text-[#433020] dark:text-gray-200"
                />
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#8a6144]/10 dark:border-gray-700">
                    <Button onClick={() => setEditModalOpen(false)} variant="secondary" className="px-6">Cancel</Button>
                    <Button onClick={handleUpdateRecord} variant="brand" className="px-6 shadow-md">Save Changes</Button>
                </div>
            </Modal>
        </div>
    );
};

export default SalaryCalculatorPage;
