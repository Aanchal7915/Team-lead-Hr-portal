import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiEdit2, FiCheck, FiX, FiPlus, FiTrash2, FiEye, FiSearch, FiCalendar, FiFilter, FiSave } from 'react-icons/fi';
import Button from '../../hr-portal/components/Button.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Modal from '../../hr-portal/components/Modal.jsx';
import Layout from '../../components/Layout';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const resolveAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith('data:')) {
        return assetPath;
    }
    const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${BACKEND_BASE_URL}${normalizedPath}`;
};

const SalarySlipManagement = () => {
    const navigate = useNavigate();
    const [salarySlips, setSalarySlips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [selectedSlipIds, setSelectedSlipIds] = useState([]);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterApproved, setFilterApproved] = useState('all');

    const [generateForm, setGenerateForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employeeIds: [],
        notes: '',
        companyName: 'AVANI ENTERPRISES',
        companyAddress: 'Soniya Vihar, Delhi',
        companyGst: '',
        authorizedSignatory: 'Director',
        companyStamp: 'AVANI ENTERPRISES',
        authorizedSignatoryImage: '',
        companyStampImage: ''
    });

    const [uploadingSig, setUploadingSig] = useState(false);
    const [uploadingStamp, setUploadingStamp] = useState(false);

    const [adjustments, setAdjustments] = useState([]);
    const [editNotes, setEditNotes] = useState('');
    const [editCompanyName, setEditCompanyName] = useState('');
    const [editCompanyAddress, setEditCompanyAddress] = useState('');
    const [editCompanyGst, setEditCompanyGst] = useState('');
    const [editEmployeeDetails, setEditEmployeeDetails] = useState({});
    const [editEmployeePhone, setEditEmployeePhone] = useState('');
    const [editEmployeeEmail, setEditEmployeeEmail] = useState('');
    const [editAttendance, setEditAttendance] = useState({ totalWorkingDays: 0, presentDays: 0, absentDays: 0 });
    const [editPayments, setEditPayments] = useState([]);
    const [editEmployeeExpenses, setEditEmployeeExpenses] = useState([]);
    const [editAuthorizedSignatory, setEditAuthorizedSignatory] = useState('');
    const [editCompanyStamp, setEditCompanyStamp] = useState('');
    const [editAuthorizedSignatoryImage, setEditAuthorizedSignatoryImage] = useState('');
    const [editCompanyStampImage, setEditCompanyStampImage] = useState('');

    const fetchSalarySlips = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterMonth) params.append('month', filterMonth);
            if (filterYear) params.append('year', filterYear);
            if (filterApproved !== 'all') params.append('isApproved', filterApproved);

            const response = await api.get(`/salary-slips?${params}`);
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) {
                setSalarySlips(data);
            } else {
                setSalarySlips([]);
            }
        } catch (error) {
            console.error('Error fetching salary slips:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees');
            const empArray = response.data.data || response.data || [];
            setEmployees(Array.isArray(empArray) ? empArray.filter(emp => emp.status === 'Active') : []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        fetchSalarySlips();
        fetchEmployees();
        setSelectedSlipIds([]);
    }, [filterMonth, filterYear, filterApproved]);

    const handleGenerateSlips = async () => {
        try {
            await api.post('/salary-slips/generate', generateForm);
            alert('Salary slips generated successfully!');
            setShowGenerateModal(false);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error generating slips:', error);
            alert(error.response?.data?.message || 'Failed to generate salary slips');
        }
    };

    const handlePrefillLatest = async () => {
        try {
            const response = await api.get('/salary-slips/latest-info');
            const info = response.data?.data || response.data;
            if (info) {
                setGenerateForm({
                    ...generateForm,
                    companyName: info.companyName || generateForm.companyName,
                    companyAddress: info.companyAddress || '',
                    companyGst: info.companyGst || '',
                    authorizedSignatory: info.authorizedSignatory || '',
                    companyStamp: info.companyStamp || '',
                    authorizedSignatoryImage: info.authorizedSignatoryImage || '',
                    companyStampImage: info.companyStampImage || ''
                });
            } else {
                alert('No previous salary slips found to pre-fill from.');
            }
        } catch (error) {
            console.error('Error fetching latest info:', error);
        }
    };

    const handleEditSlip = (slip) => {
        setSelectedSlip(slip);
        setAdjustments(slip.adjustments || []);
        setEditNotes(slip.notes || '');
        setEditCompanyName(slip.companyName || 'AVANI ENTERPRISES');
        setEditCompanyAddress(slip.companyAddress || 'Soniya Vihar, Delhi');
        setEditCompanyGst(slip.companyGst || '');
        setEditEmployeeDetails(slip.employeeBankDetails || {});
        setEditEmployeePhone(slip.employeePhone || '');
        setEditEmployeeEmail(slip.employeeEmail || '');
        setEditAttendance(slip.attendance || { totalWorkingDays: 0, presentDays: 0, absentDays: 0 });
        setEditPayments(slip.payments || []);
        setEditEmployeeExpenses(slip.employeeExpenses || []);
        setEditAuthorizedSignatory(slip.authorizedSignatory || 'Director');
        setEditCompanyStamp(slip.companyStamp || 'AVANI ENTERPRISES');
        setEditAuthorizedSignatoryImage(slip.authorizedSignatoryImage || '');
        setEditCompanyStampImage(slip.companyStampImage || '');
        setShowEditModal(true);
    };

    const handleUpdateSlip = async () => {
        try {
            await api.put(`/salary-slips/${selectedSlip._id}`, {
                adjustments,
                notes: editNotes,
                companyName: editCompanyName,
                companyAddress: editCompanyAddress,
                companyGst: editCompanyGst,
                employeeBankDetails: editEmployeeDetails,
                employeePhone: editEmployeePhone,
                employeeEmail: editEmployeeEmail,
                attendance: editAttendance,
                payments: editPayments,
                employeeExpenses: editEmployeeExpenses,
                authorizedSignatory: editAuthorizedSignatory,
                companyStamp: editCompanyStamp,
                authorizedSignatoryImage: editAuthorizedSignatoryImage,
                companyStampImage: editCompanyStampImage
            });
            setShowEditModal(false);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error updating slip:', error);
        }
    };

    const handleApproveSlips = async (slipIds) => {
        if (!slipIds.length) return;
        try {
            await api.post('/salary-slips/approve', { slipIds });
            setSelectedSlipIds([]);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error approving slips:', error);
        }
    };

    const handleDeleteSlip = async (id) => {
        if (!window.confirm('Delete this salary slip?')) return;
        try {
            await api.delete(`/salary-slips/${id}`);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error deleting slip:', error);
        }
    };

    const handleSelectSlip = (id) => {
        setSelectedSlipIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const handleDownloadPDF = (slip) => {
        const printWindow = window.open('', '_blank');
        const latestPayment = slip.payments && slip.payments.length > 0 ? slip.payments[slip.payments.length - 1] : {};
        const signatoryImageUrl = resolveAssetUrl(slip.authorizedSignatoryImage);
        const stampImageUrl = resolveAssetUrl(slip.companyStampImage);

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Salary Slip - ${slip.employeeName}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 30px; color: #000; line-height: 1.4; }
                    .container { max-width: 800px; margin: 0 auto; border: 1px solid #000; padding: 20px; }
                    .title { text-align: center; font-size: 24px; font-weight: bold; text-decoration: underline; margin-bottom: 30px; text-transform: uppercase; }
                    .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    td { padding: 8px; border: 1px solid #000; vertical-align: top; font-size: 14px; }
                    .label { font-weight: bold; width: 40%; }
                    .value { width: 60%; }
                    .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">SALARY SLIP</div>
                    <div class="section-title">Company Details</div>
                    <table>
                        <tr><td class="label">Company Name</td><td class="value">${slip.companyName || 'AVANI ENTERPRISES'}</td></tr>
                        <tr><td class="label">Company Address</td><td class="value">${slip.companyAddress || 'Soniya Vihar, Delhi'}</td></tr>
                    </table>
                    <div class="section-title">Employee Details</div>
                    <table>
                        <tr><td class="label">Employee Name</td><td class="value">${slip.employeeName}</td></tr>
                        <tr><td class="label">Employee Code</td><td class="value">${slip.employeeCode}</td></tr>
                    </table>
                    <div class="section-title">Salary Details</div>
                    <table>
                        <tr><td class="label">Gross Salary</td><td class="value">₹${(slip.baseSalary + (slip.totalAdditions || 0)).toLocaleString()}</td></tr>
                        <tr><td class="label">Total Deductions</td><td class="value">₹${(slip.totalDeductions || 0).toLocaleString()}</td></tr>
                        <tr><td class="label">Net Salary Paid</td><td class="value" style="font-weight: bold;">₹${(slip.netSalary || 0).toLocaleString()}</td></tr>
                    </table>
                    <div class="footer">
                        <div>
                            ${signatoryImageUrl ? `<img src="${signatoryImageUrl}" style="height: 40px;" /><br/>` : ''}
                            Authorized Signatory: <span style="font-weight: bold;">${slip.authorizedSignatory || 'Director'}</span>
                        </div>
                        <div style="text-align: right;">
                            ${stampImageUrl ? `<img src="${stampImageUrl}" style="height: 60px;" /><br/>` : ''}
                            <b>${slip.companyStamp || 'AVANI ENTERPRISES'}</b>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const addAdjustment = () => {
        setAdjustments([...adjustments, { type: 'addition', description: '', amount: 0 }]);
    }

    const removeAdjustment = (index) => {
        setAdjustments(adjustments.filter((_, i) => i !== index));
    }

    const updateAdjustment = (index, field, value) => {
        const updated = [...adjustments];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setAdjustments(updated);
    }

    const addPayment = () => {
        setEditPayments([...editPayments, { amount: 0, date: new Date().toISOString().split('T')[0], method: 'Bank Transfer' }]);
    }

    const removePayment = (index) => {
        setEditPayments(editPayments.filter((_, i) => i !== index));
    }

    const updatePayment = (index, field, value) => {
        const updated = [...editPayments];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setEditPayments(updated);
    }

    const addEmployeeExpense = () => {
        setEditEmployeeExpenses([...editEmployeeExpenses, { amount: 0, description: '', date: new Date().toISOString().split('T')[0], notes: '' }]);
    }

    const removeEmployeeExpense = (index) => {
        setEditEmployeeExpenses(editEmployeeExpenses.filter((_, i) => i !== index));
    }

    const updateEmployeeExpense = (index, field, value) => {
        const updated = [...editEmployeeExpenses];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setEditEmployeeExpenses(updated);
    }

    const calculateNetSalary = (baseSalary, adjustments, expenses = []) => {
        let net = baseSalary;
        adjustments.forEach(adj => {
            if (adj.type === 'addition') net += adj.amount;
            else if (adj.type === 'deduction') net -= adj.amount;
        });
        const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        net += totalExpenses;
        return Math.max(0, net);
    }

    const handleUploadAsset = async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('asset', file);
            const response = await api.post('/salary-slips/upload-asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (type === 'signatory') setEditAuthorizedSignatoryImage(response.data.filePath);
            else setEditCompanyStampImage(response.data.filePath);
        } catch (error) {
            console.error('Error uploading asset:', error);
            alert('Failed to upload image');
        }
    }



    if (loading) return (
        <Layout title="Salary Slips">
            <div className="min-h-screen bg-[#f9f0e4] flex justify-center items-center"><Spinner /></div>
        </Layout>
    );

    return (
        <Layout title="Salary Slip Management">
            <div className="min-h-screen bg-[#f9f0e4] pb-20 pt-10 px-4">
                {/* Title Section */}
                <div className="max-w-7xl mx-auto mb-16 animate-fade-in">
                    <h1 className="text-2xl sm:text-4xl font-bold mb-2">
                        <span className="text-[#8a6144]">Salary Slip</span> <span className="text-[#433020]">Management</span>
                    </h1>
                    <p className="text-sm opacity-60 font-medium text-[#433020]">Generate, edit, and approve employee salary slips</p>
                </div>

                <div className="space-y-8 max-w-7xl mx-auto">
                    {/* Filters */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 sm:p-8 rounded-2xl sm:rounded-[40px] shadow-2xl shadow-[#433020]/10 border border-white/50 dark:border-gray-700 animate-fade-in mb-16">
                    <div className="flex flex-wrap items-end gap-4 sm:gap-12">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-bold text-[#433020]/60 mb-3 ml-1">Month</label>
                            <div className="relative group">
                                <select 
                                    value={filterMonth} 
                                    onChange={(e) => setFilterMonth(e.target.value)} 
                                    className="w-full h-12 px-6 rounded-2xl bg-[#fffbf5] border border-[#8a6144]/10 text-sm font-bold text-[#433020] outline-none cursor-pointer appearance-none hover:border-[#8a6144]/30 transition-all"
                                >
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-bold text-[#433020]/60 mb-3 ml-1">Year</label>
                            <input 
                                type="text" 
                                value={filterYear} 
                                onChange={(e) => setFilterYear(e.target.value)} 
                                style={{ paddingLeft: '1.5rem' }}
                                className="w-full h-12 rounded-2xl bg-[#fffbf5] border border-[#8a6144]/10 text-sm font-bold text-[#433020] outline-none hover:border-[#8a6144]/30 transition-all shadow-sm" 
                            />
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-bold text-[#433020]/60 mb-3 ml-1">Status</label>
                            <div className="relative group">
                                <select 
                                    value={filterApproved} 
                                    onChange={(e) => setFilterApproved(e.target.value)} 
                                    className="w-full h-12 px-6 rounded-2xl bg-[#fffbf5] border border-[#8a6144]/10 text-sm font-bold text-[#433020] outline-none cursor-pointer appearance-none hover:border-[#8a6144]/30 transition-all"
                                >
                                    <option value="all">All</option>
                                    <option value="true">Approved</option>
                                    <option value="false">Pending</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={() => setShowGenerateModal(true)} 
                            variant="brand" 
                            className="bg-[#8a6144] hover:bg-[#6f4b36] h-12 px-8 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#8a6144]/20"
                        >
                            <FiPlus className="text-xl" /> Generate Slips
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {salarySlips.map(slip => (
                        <motion.div
                            key={slip._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-[#433020]/5 overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
                        >
                            <div className="bg-[#8a6144] dark:bg-gray-700 p-4 text-white relative">
                                <div className="absolute top-4 right-4">
                                    {!slip.isApproved && (
                                        <input
                                            type="checkbox"
                                            checked={selectedSlipIds.includes(slip._id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelectSlip(slip._id);
                                            }}
                                            className="rounded text-[#fff] ring-2 ring-white/50 bg-transparent cursor-pointer h-5 w-5"
                                            title="Select for approval"
                                        />
                                    )}
                                </div>
                                <h3 className="font-bold text-lg truncate pr-8">{slip.employeeName}</h3>
                                <p className="text-white/80 text-sm">{slip.employeeCode} • {slip.department}</p>
                                <div className="mt-2 inline-block px-2 py-0.5 bg-black/20 rounded text-xs">
                                    {months[slip.month - 1]} {slip.year}
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-end pb-3 border-b border-gray-100 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Net Payable</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ₹{slip.netSalary.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full inline-block ${slip.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                            slip.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {slip.paymentStatus || (slip.isApproved ? 'Verified' : 'Pending')}
                                        </p>
                                        {slip.balanceDue > 0 ? (
                                            <p className="text-xs text-red-500 font-bold mt-1 uppercase tracking-tight">Due: ₹{slip.balanceDue?.toLocaleString()}</p>
                                        ) : (
                                            <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-tighter">Fully Paid</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEditSlip(slip)}
                                        variant="brand"
                                        className="flex-1 py-2 text-sm flex items-center justify-center gap-2"
                                    >
                                        <FiEdit2 size={16} /> {slip.isApproved ? 'View Slip' : 'Edit Slip'}
                                    </Button>

                                    {!slip.isApproved && (
                                        <button
                                            onClick={() => handleApproveSlips([slip._id])}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
                                            title="Approve"
                                        >
                                            <FiCheck size={20} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDeleteSlip(slip._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Generated Code Insert */}
            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && selectedSlip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/50 dark:border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-0 overflow-hidden bg-[#f8f9fa] dark:bg-gray-900">
                                {/* Salary Slip "Paper" Representation */}
                                <div className="bg-white dark:bg-gray-800 p-4 md:p-8 shadow-sm max-w-[800px] mx-auto min-h-[800px] text-[#333] dark:text-gray-200 font-sans relative">

                                    {/* Status Watermark/Badge */}
                                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                                        {selectedSlip.isApproved ? (
                                            <div className="border border-green-500 bg-green-50/80 text-green-600 px-2 py-0.5 md:border-2 md:px-3 md:py-1 rounded-md font-bold uppercase text-[10px] md:text-xs tracking-widest transform rotate-0 opacity-90 backdrop-blur-sm">
                                                Approved
                                            </div>
                                        ) : (
                                            <div className="border border-yellow-500 bg-yellow-50/80 text-yellow-600 px-2 py-0.5 md:border-2 md:px-3 md:py-1 rounded-md font-bold uppercase text-[10px] md:text-xs tracking-widest transform rotate-0 opacity-90 backdrop-blur-sm">
                                                Pending
                                            </div>
                                        )}
                                    </div>

                                    {/* Document Header */}
                                    <div className="text-center border-b-2 border-[#8a6144] pb-6 mb-8 pt-8 md:pt-0">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            {/* Editable Company Name */}
                                            <input
                                                type="text"
                                                value={editCompanyName}
                                                onChange={(e) => setEditCompanyName(e.target.value)}
                                                className="text-lg sm:text-2xl font-extrabold text-[#8a6144] dark:text-[#d4a373] text-center bg-[#8a6144]/5 border-b-2 border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-full max-w-full sm:max-w-md uppercase tracking-wide placeholder-[#8a6144]/40 p-1 rounded-t-lg"
                                                placeholder="Company Name"
                                            />
                                            {/* Editable Company Address */}
                                            <input
                                                type="text"
                                                value={editCompanyAddress}
                                                onChange={(e) => setEditCompanyAddress(e.target.value)}
                                                className="text-xs text-center bg-[#8a6144]/5 border-b border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-full max-w-sm text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-md"
                                                placeholder="Enter Company Address"
                                            />
                                            {/* Editable Company GST */}
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
                                                <span>GSTIN:</span>
                                                <input
                                                    type="text"
                                                    value={editCompanyGst}
                                                    onChange={(e) => setEditCompanyGst(e.target.value)}
                                                    className="bg-[#8a6144]/5 border-b border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-40 uppercase text-center font-semibold py-0.5 px-2 rounded"
                                                    placeholder="ENTER GST"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mt-1">Salary Slip</p>
                                            <h3 className="text-lg font-semibold text-[#433020] dark:text-gray-300">
                                                {months[selectedSlip.month - 1]} {selectedSlip.year}
                                            </h3>
                                        </div>
                                        {/* Payment Status Badge in Edit Modal Header */}
                                        <div className="mt-4">
                                            <p className={`text - [10px] font - bold uppercase py - 0.5 px - 2 rounded - full inline - block ${selectedSlip.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                selectedSlip.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                } `}>
                                                {selectedSlip.paymentStatus}
                                            </p>
                                            {selectedSlip.balanceDue > 0 && (
                                                <p className="text-xs text-red-500 font-bold mt-1">Due: ₹{selectedSlip.balanceDue?.toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Employee & Bank Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                        {/* Left: Employee Info (Read Only mostly) */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-[#8a6144] dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                                                Employee Details
                                            </h4>
                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-[11px] sm:text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                                                <span className="font-semibold">{selectedSlip.employeeName}</span>

                                                <span className="text-gray-500 dark:text-gray-400">ID:</span>
                                                <span className="font-semibold">{selectedSlip.employeeCode}</span>

                                                <span className="text-gray-500 dark:text-gray-400">Dept:</span>
                                                <span className="font-semibold">{selectedSlip.department}</span>

                                                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeePhone}
                                                    onChange={(e) => setEditEmployeePhone(e.target.value)}
                                                    className="bg-transparent border-b border-dashed border-gray-300 focus:outline-none font-semibold text-xs"
                                                    placeholder="Phone"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeeEmail}
                                                    onChange={(e) => setEditEmployeeEmail(e.target.value)}
                                                    className="bg-transparent border-b border-dashed border-gray-300 focus:outline-none font-semibold text-xs break-all"
                                                    placeholder="Email"
                                                />
                                            </div>

                                            {/* Attendance Details */}
                                            <h4 className="text-xs font-bold text-[#8a6144] dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 pb-1 mt-6 mb-2">
                                                Attendance Details
                                            </h4>
                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-2 text-[11px] sm:text-sm items-center">
                                                <span className="text-gray-500 dark:text-gray-400">Total Days:</span>
                                                <input
                                                    type="number"
                                                    value={editAttendance.totalWorkingDays}
                                                    onChange={(e) => setEditAttendance({ ...editAttendance, totalWorkingDays: parseInt(e.target.value) || 0 })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-20"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">Present:</span>
                                                <input
                                                    type="number"
                                                    value={editAttendance.presentDays}
                                                    onChange={(e) => setEditAttendance({ ...editAttendance, presentDays: parseInt(e.target.value) || 0 })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-20"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">Absent:</span>
                                                <input
                                                    type="number"
                                                    value={editAttendance.absentDays}
                                                    onChange={(e) => setEditAttendance({ ...editAttendance, absentDays: parseInt(e.target.value) || 0 })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-20"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Bank & Tax Info (Editable) */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-[#8a6144] dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                                                Bank & Tax Details
                                            </h4>
                                            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] gap-y-2 gap-x-2 sm:gap-x-4 text-[11px] sm:text-sm items-center">
                                                <span className="text-gray-500 dark:text-gray-400">Bank Name:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeeDetails.bankName || ''}
                                                    onChange={(e) => setEditEmployeeDetails({ ...editEmployeeDetails, bankName: e.target.value })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-full"
                                                    placeholder="Bank Name"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">A/C No:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeeDetails.accountNumber || ''}
                                                    onChange={(e) => setEditEmployeeDetails({ ...editEmployeeDetails, accountNumber: e.target.value })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-full"
                                                    placeholder="Account Number"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">IFSC:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeeDetails.ifscCode || ''}
                                                    onChange={(e) => setEditEmployeeDetails({ ...editEmployeeDetails, ifscCode: e.target.value })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-full"
                                                    placeholder="IFSC Code"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">PAN Card:</span>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={editEmployeeDetails.panCardNumber || ''}
                                                        onChange={(e) => setEditEmployeeDetails({ ...editEmployeeDetails, panCardNumber: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-full"
                                                        placeholder="PAN Number"
                                                    />
                                                </div>

                                                <span className="text-gray-500 dark:text-gray-400">UPI ID:</span>
                                                <input
                                                    type="text"
                                                    value={editEmployeeDetails.upiId || ''}
                                                    onChange={(e) => setEditEmployeeDetails({ ...editEmployeeDetails, upiId: e.target.value })}
                                                    className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 focus:ring-1 focus:ring-[#8a6144] w-full"
                                                    placeholder="UPI ID"
                                                />

                                                <span className="text-gray-500 dark:text-gray-400">Credit Date:</span>
                                                <div className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 font-semibold text-xs text-gray-700 dark:text-gray-300">
                                                    {editPayments.length > 0
                                                        ? new Date(editPayments[editPayments.length - 1].date).toLocaleDateString()
                                                        : 'Not yet credited'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Salary Details Table */}
                                    <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <div className="bg-[#f8f5f2] dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                                            <h4 className="font-bold text-[#8a6144] dark:text-gray-300 uppercase text-xs tracking-wider">Salary Details</h4>
                                            <button onClick={addAdjustment} className="text-[#8a6144] hover:text-[#5d4037] text-xs font-bold flex items-center gap-1 transition-colors bg-white px-2 py-1 rounded shadow-sm border border-[#8a6144]/20 hover:bg-[#fffbf5]">
                                                <FiPlus size={12} /> Add
                                            </button>
                                        </div>

                                        <div className="p-4 bg-white dark:bg-gray-800 overflow-x-auto">
                                            <div className="min-w-[400px]">
                                                {/* Base Salary Row */}
                                                <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                                                    <span className="text-sm font-medium">Base Salary</span>
                                                    <span className="font-semibold">₹{selectedSlip.baseSalary.toLocaleString()}</span>
                                                </div>

                                                {/* Adjustments Rows */}
                                                {adjustments.map((adj, index) => (
                                                    <div key={index} className="flex gap-2 items-center py-2 border-b border-dashed border-gray-200 dark:border-gray-700">
                                                        <select
                                                            value={adj.type}
                                                            onChange={(e) => updateAdjustment(index, 'type', e.target.value)}
                                                            className="text-sm w-24 bg-transparent border-b border-gray-300 focus:border-[#8a6144] focus:outline-none dark:text-gray-300"
                                                        >
                                                            <option value="addition">Add (+)</option>
                                                            <option value="deduction">Less (-)</option>
                                                        </select>

                                                        <input
                                                            type="text"
                                                            value={adj.description}
                                                            onChange={(e) => updateAdjustment(index, 'description', e.target.value)}
                                                            placeholder="Salary Adjustment / Company Expense"
                                                            className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:border-[#8a6144] focus:outline-none dark:text-gray-300"
                                                        />

                                                        <input
                                                            type="number"
                                                            value={adj.amount}
                                                            onChange={(e) => updateAdjustment(index, 'amount', e.target.value)}
                                                            className="w-24 text-right text-sm bg-transparent border-b border-gray-300 focus:border-[#8a6144] focus:outline-none dark:text-gray-300"
                                                            placeholder="0"
                                                        />

                                                        <button
                                                            className="text-green-500 hover:text-green-700 transition-colors p-1"
                                                            title="Keep adjustment"
                                                            onClick={(e) => e.target.closest('.flex').style.backgroundColor = 'rgba(34, 197, 94, 0.05)'}
                                                        >
                                                            <FiCheck size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => removeAdjustment(index)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            title="Remove adjustment"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Salary Details Summary */}
                                                <div className="mt-8 space-y-2 border-t-2 border-dashed border-[#8a6144]/20 pt-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 font-medium uppercase tracking-wider">Gross Salary</span>
                                                        <span className="font-bold text-gray-800">
                                                            ₹{(selectedSlip.baseSalary + adjustments.reduce((sum, a) => a.type === 'addition' ? sum + (parseFloat(a.amount) || 0) : sum, 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 font-medium uppercase tracking-wider">Total Deductions</span>
                                                        <span className="font-bold text-red-600">
                                                            ₹{adjustments.reduce((sum, a) => a.type === 'deduction' ? sum + (parseFloat(a.amount) || 0) : sum, 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#8a6144]">
                                                        <span className="text-base font-bold text-[#8a6144] uppercase tracking-widest">Total Payable Amount</span>
                                                        <span className="text-xl font-black text-[#8a6144]">
                                                            ₹{calculateNetSalary(selectedSlip.baseSalary, adjustments, editEmployeeExpenses).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employee Expenses Section moved up */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center px-4 py-2 bg-[#fffbf5] dark:bg-gray-700/50 border border-[#8a6144]/30 rounded-t-lg">
                                            <h4 className="font-bold text-[#8a6144] dark:text-gray-300 uppercase text-xs tracking-wider">Employee Expenses</h4>
                                            <button onClick={addEmployeeExpense} className="text-[#8a6144] hover:text-[#5d4037] text-xs font-bold flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-[#8a6144]/20 hover:bg-[#fffbf5]">
                                                <FiPlus /> Add
                                            </button>
                                        </div>
                                        <div className="border-x border-b border-[#8a6144]/30 rounded-b-lg p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm min-w-[600px]">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 uppercase">
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Date</th>
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Description</th>
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Notes</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right font-medium">Amount</th>
                                                            <th className="px-2 py-2 w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {editEmployeeExpenses.map((expense, index) => (
                                                            <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-2 sm:px-4 py-2">
                                                                    <input
                                                                        type="date"
                                                                        value={expense.date ? new Date(expense.date).toISOString().split('T')[0] : ''}
                                                                        onChange={(e) => updateEmployeeExpense(index, 'date', e.target.value)}
                                                                        className="bg-transparent w-full focus:outline-none text-xs text-gray-700 dark:text-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={expense.description}
                                                                        onChange={(e) => updateEmployeeExpense(index, 'description', e.target.value)}
                                                                        placeholder="e.g., Travel, Materials"
                                                                        className="bg-transparent w-full focus:outline-none text-xs text-gray-700 dark:text-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={expense.notes || ''}
                                                                        onChange={(e) => updateEmployeeExpense(index, 'notes', e.target.value)}
                                                                        placeholder="Optional notes"
                                                                        className="bg-transparent w-full focus:outline-none text-xs text-gray-400 dark:text-gray-500 italic"
                                                                    />
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 text-right">
                                                                    <input
                                                                        type="number"
                                                                        value={expense.amount}
                                                                        onChange={(e) => updateEmployeeExpense(index, 'amount', e.target.value)}
                                                                        className="bg-transparent w-20 text-right focus:outline-none text-xs font-medium text-green-600 dark:text-green-400"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-2 flex items-center justify-end gap-1">
                                                                    <button
                                                                        className="text-green-500 hover:text-green-700 transition-all p-1"
                                                                        title="Confirm expense"
                                                                    >
                                                                        <FiCheck size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => removeEmployeeExpense(index)}
                                                                        className="text-red-500 hover:text-red-700 transition-opacity p-1"
                                                                        title="Remove expense"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {editEmployeeExpenses.length === 0 && (
                                                            <tr>
                                                                <td colSpan="5" className="px-4 py-3 text-center text-gray-400 italic font-light">No expenses recorded</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    {editEmployeeExpenses.length > 0 && (
                                                        <tfoot className="bg-[#fffbf5] dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300">
                                                            <tr>
                                                                <td colSpan="3" className="px-4 py-2 text-right text-xs uppercase text-gray-500">Total Expenses (Added to Salary)</td>
                                                                <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">
                                                                    +₹{editEmployeeExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0).toLocaleString()}
                                                                </td>
                                                                <td></td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment History Section */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center px-4 py-2 bg-[#f8f5f2] dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-t-lg">
                                            <h4 className="font-bold text-[#8a6144] dark:text-gray-300 uppercase text-xs tracking-wider">Payment History</h4>
                                            <button onClick={addPayment} className="text-[#8a6144] hover:text-[#5d4037] text-xs font-bold flex items-center gap-1">
                                                <FiPlus /> Add
                                            </button>
                                        </div>
                                        <div className="border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm min-w-[600px]">
                                                    <thead>
                                                        <tr className="bg-gray-50 dark:bg-gray-800 text-left text-xs text-gray-500 uppercase">
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Date</th>
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Method</th>
                                                            <th className="px-2 sm:px-4 py-2 font-medium">Ref ID</th>
                                                            <th className="px-2 sm:px-4 py-2 text-right font-medium">Amount</th>
                                                            <th className="px-2 py-2 w-8"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {editPayments.map((payment, index) => (
                                                            <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-2 sm:px-4 py-2">
                                                                    <div className="flex flex-col">
                                                                        <input
                                                                            type="datetime-local"
                                                                            value={payment.date ? new Date(new Date(payment.date).getTime() - new Date(payment.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                                            onChange={(e) => updatePayment(index, 'date', e.target.value)}
                                                                            className="bg-transparent w-full focus:outline-none text-xs text-gray-700 dark:text-gray-300"
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <select
                                                                        value={payment.method}
                                                                        onChange={(e) => updatePayment(index, 'method', e.target.value)}
                                                                        className="bg-transparent w-full focus:outline-none text-gray-700 dark:text-gray-300"
                                                                    >
                                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                                        <option value="Cash">Cash</option>
                                                                        <option value="UPI">UPI</option>
                                                                        <option value="Cheque">Cheque</option>
                                                                    </select>
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        value={payment.referenceId || ''}
                                                                        onChange={(e) => updatePayment(index, 'referenceId', e.target.value)}
                                                                        placeholder="-"
                                                                        className="bg-transparent w-full focus:outline-none text-gray-700 dark:text-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-2 sm:px-4 py-2 text-right">
                                                                    <input
                                                                        type="number"
                                                                        value={payment.amount}
                                                                        onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                                                                        className="bg-transparent w-24 text-right focus:outline-none font-medium text-gray-700 dark:text-gray-300"
                                                                    />
                                                                </td>
                                                                <td className="px-2 py-2 flex items-center justify-center gap-1">
                                                                    <button
                                                                        className="text-green-500 hover:text-green-700 transition-all p-1"
                                                                        title="Confirm payment"
                                                                    >
                                                                        <FiCheck size={14} />
                                                                    </button>
                                                                    <button onClick={() => removePayment(index)} className="text-red-400 hover:text-red-600 transition-all p-1" title="Remove payment">
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {editPayments.length === 0 && (
                                                            <tr>
                                                                <td colSpan="5" className="px-4 py-3 text-center text-gray-400 italic font-light">No payments recorded</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300">
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-2 text-right text-xs uppercase text-gray-500">Total Paid</td>
                                                            <td className="px-4 py-2 text-right text-[#10b981]">
                                                                ₹{editPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString()}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-2 text-right text-xs uppercase text-gray-500">Balance Due</td>
                                                            <td className={`px - 4 py - 2 text - right ${Math.max(0, calculateNetSalary(selectedSlip.baseSalary, adjustments, editEmployeeExpenses) - editPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)) > 0 ? 'text-red-500' : 'text-green-500'} `}>
                                                                ₹{Math.max(0, calculateNetSalary(selectedSlip.baseSalary, adjustments, editEmployeeExpenses) - editPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toLocaleString()}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Notes Section */}
                                    <div className="bg-[#fffbf5] dark:bg-gray-700/30 p-4 border border-dashed border-[#8a6144]/30 rounded-lg">
                                        <h4 className="text-xs font-bold text-[#8a6144] dark:text-gray-400 uppercase mb-2">Notes</h4>
                                        <textarea
                                            value={editNotes}
                                            onChange={(e) => setEditNotes(e.target.value)}
                                            rows={2}
                                            className="w-full bg-transparent border-none text-sm text-gray-600 dark:text-gray-300 focus:ring-0 p-0 resize-none italic"
                                            placeholder="Add notes here..."
                                        />
                                    </div>

                                    {/* Signatory & Stamp Section */}
                                    <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-gray-100 dark:border-gray-700 pt-6 px-4 gap-8">
                                        <div className="flex flex-col gap-2 w-full md:w-1/2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter shrink-0">Authorized Signatory:</span>
                                                <input
                                                    type="text"
                                                    value={editAuthorizedSignatory}
                                                    onChange={(e) => setEditAuthorizedSignatory(e.target.value)}
                                                    className="bg-[#8a6144]/5 border-b border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-full text-xs font-bold text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded"
                                                    placeholder="Signatory Name/Role"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadAsset(e.target.files[0], 'signatory')}
                                                    className="hidden"
                                                    id="signatory-upload"
                                                />
                                                <label htmlFor="signatory-upload" className="cursor-pointer text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 transition-colors">
                                                    Upload Signature
                                                </label>
                                                {editAuthorizedSignatoryImage && (
                                                    <div className="relative group">
                                                        <img
                                                            src={resolveAssetUrl(editAuthorizedSignatoryImage)}
                                                            alt="Signature"
                                                            className="h-8 w-auto border border-gray-200 rounded"
                                                        />
                                                        <button
                                                            onClick={() => setEditAuthorizedSignatoryImage('')}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hidden group-hover:block"
                                                        >
                                                            <FiX size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right w-full md:w-1/3 flex flex-col items-start md:items-end gap-2">
                                            <input
                                                type="text"
                                                value={editCompanyStamp}
                                                onChange={(e) => setEditCompanyStamp(e.target.value)}
                                                className="bg-[#8a6144]/5 border-b border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-full text-xs font-bold text-gray-800 dark:text-gray-200 text-right px-1 py-0.5 rounded uppercase placeholder:normal-case"
                                                placeholder="Company Stamp Text"
                                            />
                                            <div className="flex items-center gap-2">
                                                {editCompanyStampImage && (
                                                    <div className="relative group">
                                                        <img
                                                            src={resolveAssetUrl(editCompanyStampImage)}
                                                            alt="Stamp"
                                                            className="h-10 w-auto border border-gray-200 rounded"
                                                        />
                                                        <button
                                                            onClick={() => setEditCompanyStampImage('')}
                                                            className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full p-0.5 hidden group-hover:block"
                                                        >
                                                            <FiX size={10} />
                                                        </button>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleUploadAsset(e.target.files[0], 'stamp')}
                                                    className="hidden"
                                                    id="stamp-upload"
                                                />
                                                <label htmlFor="stamp-upload" className="cursor-pointer text-[10px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 transition-colors">
                                                    Upload Stamp
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Disclaimer */}
                                    <div className="mt-6 pt-4 text-center border-t border-gray-50 dark:border-gray-800">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                            Computer Generated Salary Slip • {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex gap-2 md:gap-3 justify-end">
                                <Button
                                    onClick={() => setShowEditModal(false)}
                                    variant="secondary"
                                    className="text-[10px] md:text-sm px-2 md:px-4 py-2"
                                >
                                    {selectedSlip.isApproved ? 'Close' : 'Cancel'}
                                </Button>
                                <Button
                                    onClick={() => handleDownloadPDF({
                                        ...selectedSlip,
                                        adjustments,
                                        employeeExpenses: editEmployeeExpenses,
                                        payments: editPayments,
                                        companyName: editCompanyName,
                                        companyAddress: editCompanyAddress,
                                        companyGst: editCompanyGst,
                                        employeeBankDetails: editEmployeeDetails,
                                        employeePhone: editEmployeePhone,
                                        employeeEmail: editEmployeeEmail,
                                        attendance: editAttendance,
                                        netSalary: calculateNetSalary(selectedSlip.baseSalary, adjustments, editEmployeeExpenses),
                                        balanceDue: Math.max(0, calculateNetSalary(selectedSlip.baseSalary, adjustments, editEmployeeExpenses) - editPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)),
                                        authorizedSignatory: editAuthorizedSignatory,
                                        companyStamp: editCompanyStamp,
                                        authorizedSignatoryImage: editAuthorizedSignatoryImage,
                                        companyStampImage: editCompanyStampImage,
                                        totalAdditions: (adjustments || []).reduce((sum, a) => a.type === 'addition' ? sum + (parseFloat(a.amount) || 0) : sum, 0) + (editEmployeeExpenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
                                        totalDeductions: (adjustments || []).reduce((sum, a) => a.type === 'deduction' ? sum + (parseFloat(a.amount) || 0) : sum, 0)
                                    })}
                                    variant="brand"
                                    className="flex items-center gap-1 md:gap-2 bg-blue-600 hover:bg-blue-700 text-[10px] md:text-sm px-2 md:px-4 py-2"
                                >
                                    <FiDownload className="shrink-0" /> <span className="whitespace-nowrap">Download Slip</span>
                                </Button>
                                <Button
                                    onClick={handleUpdateSlip}
                                    variant="brand"
                                    className="text-[10px] md:text-sm px-2 md:px-4 py-2 whitespace-nowrap"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Salary Slips">
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={handlePrefillLatest}
                            className="text-[11px] font-bold text-[#8a6144] hover:bg-[#8a6144]/5 border border-[#8a6144]/30 px-4 py-1.5 rounded-full uppercase tracking-widest bg-white transition-all shadow-sm"
                        >
                            Prefill from Latest
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Month</label>
                            <select
                                value={generateForm.month}
                                onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                            >
                                {months.map((month, idx) => (
                                    <option key={idx} value={idx + 1}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Year</label>
                            <input
                                type="number"
                                value={generateForm.year}
                                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Company Name</label>
                            <input
                                type="text"
                                value={generateForm.companyName}
                                onChange={(e) => setGenerateForm({ ...generateForm, companyName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                placeholder="Enter company name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Company Address</label>
                            <input
                                type="text"
                                value={generateForm.companyAddress}
                                onChange={(e) => setGenerateForm({ ...generateForm, companyAddress: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                placeholder="Enter company address"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[#433020] mb-2">Authorized Signatory</label>
                                <input
                                    type="text"
                                    value={generateForm.authorizedSignatory}
                                    onChange={(e) => setGenerateForm({ ...generateForm, authorizedSignatory: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                    placeholder="Director"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#433020] mb-2">Company Stamp Text</label>
                                <input
                                    type="text"
                                    value={generateForm.companyStamp}
                                    onChange={(e) => setGenerateForm({ ...generateForm, companyStamp: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                    placeholder="AVANI ENTERPRISES"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#433020] mb-2">Signature Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            try {
                                                setUploadingSig(true);
                                                const formData = new FormData();
                                                formData.append('asset', file);
                                                const response = await api.post('/salary-slips/upload-asset', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                setGenerateForm(prev => ({ ...prev, authorizedSignatoryImage: response.data.filePath }));
                                            } catch (error) {
                                                console.error('Signature upload failed:', error);
                                                alert('Failed to upload signature.');
                                            } finally {
                                                setUploadingSig(false);
                                                e.target.value = null;
                                            }
                                        }}
                                        className="hidden"
                                        id="gen-signatory-upload"
                                        disabled={uploadingSig}
                                    />
                                    <label 
                                        htmlFor={uploadingSig ? "" : "gen-signatory-upload"} 
                                        className={`cursor-pointer text-[12px] px-5 py-2 rounded-md border transition-all flex items-center gap-2 font-bold ${uploadingSig ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-[#f4f4f4] hover:bg-gray-200 text-[#433020] border-gray-300 shadow-sm'}`}
                                    >
                                        {uploadingSig ? 'Uploading...' : 'Upload'}
                                    </label>
                                    {generateForm.authorizedSignatoryImage && !uploadingSig && (
                                        <div className="h-9 w-9 border border-green-200 bg-green-50 rounded-md flex items-center justify-center">
                                            <FiCheck className="text-green-600" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#433020] mb-2">Stamp Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            try {
                                                setUploadingStamp(true);
                                                const formData = new FormData();
                                                formData.append('asset', file);
                                                const response = await api.post('/salary-slips/upload-asset', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                });
                                                setGenerateForm(prev => ({ ...prev, companyStampImage: response.data.filePath }));
                                            } catch (error) {
                                                console.error('Stamp upload failed:', error);
                                                alert('Failed to upload stamp.');
                                            } finally {
                                                setUploadingStamp(false);
                                                e.target.value = null;
                                            }
                                        }}
                                        className="hidden"
                                        id="gen-stamp-upload"
                                        disabled={uploadingStamp}
                                    />
                                    <label 
                                        htmlFor={uploadingStamp ? "" : "gen-stamp-upload"} 
                                        className={`cursor-pointer text-[12px] px-5 py-2 rounded-md border transition-all flex items-center gap-2 font-bold ${uploadingStamp ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-[#f4f4f4] hover:bg-gray-200 text-[#433020] border-gray-300 shadow-sm'}`}
                                    >
                                        {uploadingStamp ? 'Uploading...' : 'Upload'}
                                    </label>
                                    {generateForm.companyStampImage && !uploadingStamp && (
                                        <div className="h-9 w-9 border border-green-200 bg-green-50 rounded-md flex items-center justify-center">
                                            <FiCheck className="text-green-600" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Company GST (Optional)</label>
                            <input
                                type="text"
                                value={generateForm.companyGst}
                                onChange={(e) => setGenerateForm({ ...generateForm, companyGst: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                placeholder="Enter Company GST"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Select Employees (Leave empty for all active employees)</label>
                            <div className="border border-gray-200 rounded-lg p-2 max-h-48 overflow-y-auto bg-white">
                                {employees.map(emp => (
                                    <label key={emp._id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-md cursor-pointer transition-all">
                                        <input
                                            type="checkbox"
                                            checked={generateForm.employeeIds.includes(emp._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setGenerateForm({ ...generateForm, employeeIds: [...generateForm.employeeIds, emp._id] });
                                                else setGenerateForm({ ...generateForm, employeeIds: generateForm.employeeIds.filter(id => id !== emp._id) });
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-[#8a6144] focus:ring-[#8a6144]"
                                        />
                                        <span className="text-sm text-[#433020]">{emp.name} <span className="text-gray-400 text-xs font-normal">({emp.employeeId})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#433020] mb-2">Notes (Optional)</label>
                            <textarea
                                value={generateForm.notes}
                                onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-[#433020] focus:ring-2 focus:ring-[#8a6144]/10 focus:border-[#8a6144] outline-none transition-all"
                                placeholder="Add any notes for this salary period..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button onClick={() => setShowGenerateModal(false)} variant="secondary" className="flex-1 rounded-lg py-3">Cancel</Button>
                        <Button onClick={handleGenerateSlips} variant="brand" className="flex-1 rounded-lg py-3">Generate</Button>
                    </div>
                </div>
            </Modal>
            </div>
        </Layout>
    );
};
export default SalarySlipManagement;
