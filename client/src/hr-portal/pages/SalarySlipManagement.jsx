import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiEdit2, FiCheck, FiX, FiPlus, FiTrash2, FiEye } from 'react-icons/fi';
import Button from '../components/Button.jsx';
import Spinner from '../components/Spinner.jsx';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const resolveAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith('data:')) {
        return assetPath;
    }
    const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${BACKEND_BASE_URL}${normalizedPath}`;
};

const SalarySlipManagement = () => {
    const [salarySlips, setSalarySlips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedSlipIds, setSelectedSlipIds] = useState([]);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterApproved, setFilterApproved] = useState('all');

    // Generate form state
    const [generateForm, setGenerateForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employeeIds: [],
        notes: '',
        companyName: 'Avani Enterprises',
        companyAddress: 'Soniya Vihar, Delhi',
        companyGst: '',
        authorizedSignatory: 'Director',
        companyStamp: 'AVANI ENTERPRISES',
        authorizedSignatoryImage: '',
        companyStampImage: ''
    });

    // Edit form state
    const [adjustments, setAdjustments] = useState([]);
    const [editNotes, setEditNotes] = useState('');
    const [editCompanyName, setEditCompanyName] = useState('');
    const [editCompanyAddress, setEditCompanyAddress] = useState('');
    const [editCompanyGst, setEditCompanyGst] = useState('');
    const [editEmployeeDetails, setEditEmployeeDetails] = useState({});
    const [editEmployeePhone, setEditEmployeePhone] = useState('');
    const [editEmployeeEmail, setEditEmployeeEmail] = useState('');
    const [editAttendance, setEditAttendance] = useState({
        totalWorkingDays: 0,
        presentDays: 0,
        absentDays: 0
    });
    const [editPayments, setEditPayments] = useState([]);
    const [editEmployeeExpenses, setEditEmployeeExpenses] = useState([]);
    const [editAuthorizedSignatory, setEditAuthorizedSignatory] = useState('');
    const [editCompanyStamp, setEditCompanyStamp] = useState('');
    const [editAuthorizedSignatoryImage, setEditAuthorizedSignatoryImage] = useState('');
    const [editCompanyStampImage, setEditCompanyStampImage] = useState('');
    const [latestCompanyInfo, setLatestCompanyInfo] = useState(null);

    useEffect(() => {
        fetchSalarySlips();
        fetchEmployees();
        fetchLatestInfo(); // Fetch latest signatory/stamp info to use as defaults
        setSelectedSlipIds([]); // Clear selection when filters change
    }, [filterMonth, filterYear, filterApproved]);

    const fetchSalarySlips = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterMonth) params.append('month', filterMonth);
            if (filterYear) params.append('year', filterYear);
            if (filterApproved !== 'all') params.append('isApproved', filterApproved);

            const response = await api.get(`/salary-slips?${params}`);
            setSalarySlips(response.data);
        } catch (error) {
            console.error('Error fetching salary slips:', error);
            console.error('Error response:', error.response);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch salary slips';
            alert(`Failed to fetch salary slips: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees');
            setEmployees(response.data.filter(emp => emp.status === 'Active'));
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchLatestInfo = async () => {
        try {
            const response = await api.get('/salary-slips/latest-info');
            setLatestCompanyInfo(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching latest info:', error);
            return null;
        }
    };

    // Auto-sync generate form with latest info when it becomes available
    useEffect(() => {
        if (latestCompanyInfo) {
            setGenerateForm(prev => ({
                ...prev,
                companyName: latestCompanyInfo.companyName || prev.companyName,
                companyAddress: latestCompanyInfo.companyAddress || prev.companyAddress,
                companyGst: latestCompanyInfo.companyGst || prev.companyGst,
                authorizedSignatory: latestCompanyInfo.authorizedSignatory || prev.authorizedSignatory,
                companyStamp: latestCompanyInfo.companyStamp || prev.companyStamp,
                authorizedSignatoryImage: latestCompanyInfo.authorizedSignatoryImage || prev.authorizedSignatoryImage,
                companyStampImage: latestCompanyInfo.companyStampImage || prev.companyStampImage
            }));
        }
    }, [latestCompanyInfo]);

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
    };

    const handlePrefillLatest = async () => {
        const info = await fetchLatestInfo();
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
    };

    const handleGenerateSlips = async () => {
        try {
            await api.post('/salary-slips/generate', generateForm);
            alert('Salary slips generated successfully!');
            setShowGenerateModal(false);
            setGenerateForm({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                employeeIds: [],
                notes: '',
                companyName: generateForm.companyName,
                companyAddress: generateForm.companyAddress,
                companyGst: generateForm.companyGst,
                authorizedSignatory: generateForm.authorizedSignatory,
                companyStamp: generateForm.companyStamp,
                authorizedSignatoryImage: generateForm.authorizedSignatoryImage,
                companyStampImage: generateForm.companyStampImage
            });
            fetchSalarySlips();
        } catch (error) {
            console.error('Error generating slips:', error);
            alert(error.response?.data?.message || 'Failed to generate salary slips');
        }
    };

    const handleEditSlip = (slip) => {
        setSelectedSlip(slip);
        setAdjustments(slip.adjustments || []);
        setEditNotes(slip.notes || '');

        // Use latest company info as fallback for consistency across all slips
        setEditCompanyName(slip.companyName || latestCompanyInfo?.companyName || 'Avani Enterprises');
        setEditCompanyAddress(slip.companyAddress || latestCompanyInfo?.companyAddress || 'Soniya Vihar, Delhi');
        setEditCompanyGst(slip.companyGst || latestCompanyInfo?.companyGst || '');

        setEditEmployeeDetails(slip.employeeBankDetails || {});
        setEditEmployeePhone(slip.employeePhone || '');
        setEditEmployeeEmail(slip.employeeEmail || '');
        setEditAttendance(slip.attendance || { totalWorkingDays: 0, presentDays: 0, absentDays: 0 });
        setEditPayments(slip.payments || []);
        setEditEmployeeExpenses(slip.employeeExpenses || []);

        // Ensure signature and stamp fallback to latest globally used values if not set for this slip
        setEditAuthorizedSignatory(slip.authorizedSignatory || latestCompanyInfo?.authorizedSignatory || 'Director');
        setEditCompanyStamp(slip.companyStamp || latestCompanyInfo?.companyStamp || 'AVANI ENTERPRISES');
        setEditAuthorizedSignatoryImage(slip.authorizedSignatoryImage || latestCompanyInfo?.authorizedSignatoryImage || '');
        setEditCompanyStampImage(slip.companyStampImage || latestCompanyInfo?.companyStampImage || '');

        setShowEditModal(true);
    };

    const handleUpdateSlip = async () => {
        try {
            // Validate adjustments
            for (const adj of adjustments) {
                if (!adj.description || adj.description.trim() === '') {
                    alert('Please fill in descriptions for all adjustments. It is mandatory.');
                    return;
                }
            }

            // Removed restriction on editing approved salary slips in UI
            await api.put(
                `/salary-slips/${selectedSlip._id}`,
                {
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
                }
            );
            alert('Salary slip updated successfully!');
            setShowEditModal(false);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error updating slip:', error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to update salary slip';
            alert(`Error: ${errMsg}`);
        }
    };

    const handleApproveSlips = async (slipIds) => {
        if (!slipIds || slipIds.length === 0) {
            alert('Please select at least one salary slip to approve');
            return;
        }
        try {
            await api.post('/salary-slips/approve', { slipIds });
            alert(`Successfully approved ${slipIds.length} salary slip(s)!`);
            setSelectedSlipIds([]);
            fetchSalarySlips();
        } catch (error) {
            console.error('Error approving slips:', error);
            alert(error.response?.data?.message || 'Failed to approve salary slips');
        }
    };

    const handleSelectSlip = (slipId) => {
        setSelectedSlipIds(prev => {
            if (prev.includes(slipId)) {
                return prev.filter(id => id !== slipId);
            } else {
                return [...prev, slipId];
            }
        });
    };

    const handleSelectAll = () => {
        const unapprovedSlips = salarySlips.filter(slip => !slip.isApproved);
        if (selectedSlipIds.length === unapprovedSlips.length) {
            setSelectedSlipIds([]);
        } else {
            setSelectedSlipIds(unapprovedSlips.map(slip => slip._id));
        }
    };

    const handleDeleteSlip = async (slipId) => {
        if (!window.confirm('Are you sure you want to delete this salary slip?')) return;

        try {
            const response = await api.delete(`/salary-slips/${slipId}`);
            console.log('Delete response:', response.data);
            alert('Salary slip deleted successfully!');
            fetchSalarySlips();
        } catch (error) {
            console.error('Error deleting slip:', error);
            alert(error.response?.data?.message || 'Failed to delete salary slip');
        }
    };

    const addAdjustment = () => {
        setAdjustments([...adjustments, { type: 'addition', description: '', amount: 0 }]);
    };

    const removeAdjustment = (index) => {
        setAdjustments(adjustments.filter((_, i) => i !== index));
    };

    const updateAdjustment = (index, field, value) => {
        const updated = [...adjustments];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setAdjustments(updated);
    };

    const addPayment = () => {
        setEditPayments([...editPayments, { amount: 0, date: new Date().toISOString().split('T')[0], method: 'Bank Transfer' }]);
    };

    const removePayment = (index) => {
        setEditPayments(editPayments.filter((_, i) => i !== index));
    };

    const updatePayment = (index, field, value) => {
        const updated = [...editPayments];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setEditPayments(updated);
    };

    const addEmployeeExpense = () => {
        setEditEmployeeExpenses([...editEmployeeExpenses, { amount: 0, description: '', date: new Date().toISOString().split('T')[0], notes: '' }]);
    };

    const removeEmployeeExpense = (index) => {
        setEditEmployeeExpenses(editEmployeeExpenses.filter((_, i) => i !== index));
    };

    const updateEmployeeExpense = (index, field, value) => {
        const updated = [...editEmployeeExpenses];
        updated[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
        setEditEmployeeExpenses(updated);
    };

    const calculateNetSalary = (baseSalary, adjustments, expenses = []) => {
        let net = baseSalary;
        adjustments.forEach(adj => {
            if (adj.type === 'addition') net += adj.amount;
            else if (adj.type === 'deduction') net -= adj.amount;
        });
        const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        net += totalExpenses;
        return Math.max(0, net);
    };

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
                    .signatory-line { border-bottom: 1px solid #000; width: 200px; display: inline-block; margin-left: 10px; height: 1px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="title">SALARY SLIP</div>

                    <div class="section-title">Company Details</div>
                    <table>
                        <tr><td class="label">Company Name</td><td class="value">${slip.companyName || 'Avani Enterprises'}</td></tr>
                        <tr><td class="label">Company Address</td><td class="value">${slip.companyAddress || 'Soniya Vihar, Delhi'}</td></tr>
                        <tr><td class="label">GST Number</td><td class="value">${slip.companyGst || '-'}</td></tr>
                    </table>

                    <div class="section-title">Employee Details</div>
                    <table>
                        <tr><td class="label">Employee Name</td><td class="value">${slip.employeeName}</td></tr>
                        <tr><td class="label">Employee Code</td><td class="value">${slip.employeeCode}</td></tr>
                        <tr><td class="label">Phone Number</td><td class="value">${slip.employeePhone || '-'}</td></tr>
                        <tr><td class="label">Email ID</td><td class="value">${slip.employeeEmail || '-'}</td></tr>
                    </table>

                    <div class="section-title">Bank & Payment Details</div>
                    <table>
                        <tr><td class="label">Account Number</td><td class="value">${slip.employeeBankDetails?.accountNumber || '-'}</td></tr>
                        <tr><td class="label">UPI ID</td><td class="value">${slip.employeeBankDetails?.upiId || '-'}</td></tr>
                        <tr><td class="label">Transaction ID</td><td class="value">${latestPayment.referenceId || '-'}</td></tr>
                        <tr><td class="label">Date of Salary Credit</td><td class="value">${latestPayment.date ? new Date(latestPayment.date).toLocaleDateString() : '-'}</td></tr>
                    </table>

                    <div class="section-title">Attendance Details</div>
                    <table>
                        <tr><td class="label">Total Working Days</td><td class="value">${slip.attendance?.totalWorkingDays || 0}</td></tr>
                        <tr><td class="label">Present Days</td><td class="value">${slip.attendance?.presentDays || 0}</td></tr>
                        <tr><td class="label">Absent Days</td><td class="value">${slip.attendance?.absentDays || 0}</td></tr>
                    </table>

                    <div class="section-title">Salary Details</div>
                    <table>
                        <tr><td class="label">Gross Salary</td><td class="value">₹${(slip.baseSalary + (slip.totalAdditions || 0)).toLocaleString()}</td></tr>
                        <tr><td class="label">Total Deductions</td><td class="value">₹${(slip.totalDeductions || 0).toLocaleString()}</td></tr>
                        <tr><td class="label">Net Salary Paid</td><td class="value" style="font-weight: bold;">₹${(slip.netSalary || 0).toLocaleString()}</td></tr>
                    </table>

                    ${slip.employeeExpenses && slip.employeeExpenses.length > 0 ? `
                        <div class="section-title">Employee Expenses (Reimbursement)</div>
                        <table>
                            ${slip.employeeExpenses.map(expense => `
                                <tr>
                                    <td class="label">${expense.description}${expense.notes ? ` (${expense.notes})` : ''}</td>
                                    <td class="value" style="color: #10b981; font-weight: bold;">+₹${expense.amount.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="font-size: 10px; color: #666; padding-left: 20px;">Date: ${new Date(expense.date).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                            <tr style="border-top: 2px solid #10b981;">
                                <td class="label" style="font-weight: bold; color: #10b981;">Total Expenses Added</td>
                                <td class="value" style="font-weight: bold; color: #10b981;">+₹${slip.employeeExpenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}</td>
                            </tr>
                        </table>
                    ` : ''}


                    <div class="section-title">Payment Summary</div>
                    <table>
                        <tr>
                            <td class="label">Total Amount Payable</td>
                            <td class="value" style="font-weight:bold;">₹${(slip.netSalary || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Total Paid Till Date</td>
                            <td class="value" style="color: #10b981; font-weight: bold;">₹${(slip.totalPaid || 0).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Balance Due</td>
                            <td class="value" style="color: ${(slip.balanceDue || 0) > 0 ? '#ef4444' : '#10b981'}; font-weight: bold;">₹${(slip.balanceDue || 0).toLocaleString()}</td>
                        </tr>
                    </table>

                    ${slip.payments && slip.payments.length > 0 ? `
                        <div class="section-title">Payment Details</div>
                        <table>
                            <thead>
                                <tr style="background-color: #f3f4f6;">
                                    <td class="label" style="width: 25%;">Date</td>
                                    <td class="label" style="width: 25%;">Method</td>
                                    <td class="label" style="width: 25%;">Ref ID</td>
                                    <td class="label" style="width: 25%; text-align: right;">Amount</td>
                                </tr>
                            </thead>
                            <tbody>
                                ${slip.payments.map(payment => `
                                    <tr>
                                        <td>${new Date(payment.date).toLocaleDateString()}</td>
                                        <td>${payment.method}</td>
                                        <td>${payment.referenceId || '-'}</td>
                                        <td style="text-align: right;">₹${payment.amount.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}

                    <div class="footer">
                        <div style="flex: 1;">
                            ${signatoryImageUrl
                ? `<div style="margin-bottom: 5px;"><img src="${signatoryImageUrl}" style="height: 40px; width: auto;" /></div>`
                : ''
            }
                            Authorized Signatory: <span style="font-weight: bold; border-bottom: 1px solid #000; display: inline-block; min-width: 120px; text-align: center;">${slip.authorizedSignatory || ''}</span>
                        </div>
                        <div style="text-align: right; flex: 1;">
                            ${stampImageUrl
                ? `<div style="margin-bottom: 5px;"><img src="${stampImageUrl}" style="height: 60px; width: auto;" /></div>`
                : ''
            }
                            <div style="font-weight: bold;">${slip.companyStamp || 'Company Stamp'}</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();

        // Wait for images to load before printing
        const images = printWindow.document.querySelectorAll('img');
        if (images.length > 0) {
            let loadedCount = 0;
            const onImageLoad = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                }
            };
            images.forEach(img => {
                if (img.complete) onImageLoad();
                else {
                    img.onload = onImageLoad;
                    img.onerror = onImageLoad;
                }
            });
        } else {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-4xl font-extrabold text-[#433020] dark:text-white mb-2 drop-shadow-sm tracking-tight">
                        <span className="text-[#8a6144]">Salary Slip</span> Management
                    </h1>
                    <p className="text-[#8a6144] dark:text-gray-400">Generate, edit, and approve employee salary slips</p>
                </motion.div>

                {/* Filters and Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 p-6 mb-6 border border-white/50 dark:border-gray-700"
                >
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Month</label>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                            >
                                {months.map((month, idx) => (
                                    <option key={idx} value={idx + 1}>{month}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Year</label>
                            <input
                                type="number"
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Status</label>
                            <select
                                value={filterApproved}
                                onChange={(e) => setFilterApproved(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                            >
                                <option value="all">All</option>
                                <option value="true">Approved</option>
                                <option value="false">Pending</option>
                            </select>
                        </div>
                        <Button
                            onClick={() => setShowGenerateModal(true)}
                            variant="brand"
                            className="flex items-center gap-2"
                        >
                            <FiPlus /> Generate Slips
                        </Button>
                        {selectedSlipIds.length > 0 && (
                            <Button
                                onClick={() => handleApproveSlips(selectedSlipIds)}
                                variant="primary"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <FiCheck /> Approve Selected ({selectedSlipIds.length})
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Salary Slips Grid (Image-like Format) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    {salarySlips.length === 0 ? (
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl p-12 text-center border border-white/50 dark:border-gray-700">
                            <p className="text-[#433020] dark:text-gray-300 text-lg">No salary slips found</p>
                            <p className="text-[#8a6144] dark:text-gray-400 mt-2">Generate salary slips to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {salarySlips.map((slip, index) => (
                                <motion.div
                                    key={slip._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-[#433020]/5 overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 group"
                                >
                                    {/* Card Header (Mini Slip Header) */}
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

                                    {/* Card Body */}
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-between items-end pb-3 border-b border-gray-100 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Net Payable</p>
                                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    ₹{slip.netSalary.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text - [10px] font - bold uppercase py - 0.5 px - 2 rounded - full inline - block ${slip.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    slip.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    } `}>
                                                    {slip.paymentStatus}
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
                    )}
                </motion.div>

                {/* Generate Modal - Stylized */}
                <AnimatePresence>
                    {showGenerateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowGenerateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 dark:border-gray-700"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-[#433020] dark:text-white">Generate Salary Slips</h2>
                                    <button
                                        onClick={handlePrefillLatest}
                                        className="text-[10px] font-bold text-[#8a6144] hover:text-[#5d4037] border border-[#8a6144]/30 px-3 py-1 rounded-full uppercase tracking-widest bg-[#fffbf5] transition-all"
                                    >
                                        Prefill from Latest
                                    </button>
                                </div>
                                <div className="p-4 md:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Month</label>
                                            <select
                                                value={generateForm.month}
                                                onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                            >
                                                {months.map((month, idx) => (
                                                    <option key={idx} value={idx + 1}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Year</label>
                                            <input
                                                type="number"
                                                value={generateForm.year}
                                                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            value={generateForm.companyName}
                                            onChange={(e) => setGenerateForm({ ...generateForm, companyName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Company Address</label>
                                        <input
                                            type="text"
                                            value={generateForm.companyAddress}
                                            onChange={(e) => setGenerateForm({ ...generateForm, companyAddress: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Authorized Signatory</label>
                                            <input
                                                type="text"
                                                value={generateForm.authorizedSignatory}
                                                onChange={(e) => setGenerateForm({ ...generateForm, authorizedSignatory: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                                placeholder="e.g. Director"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Company Stamp Text</label>
                                            <input
                                                type="text"
                                                value={generateForm.companyStamp}
                                                onChange={(e) => setGenerateForm({ ...generateForm, companyStamp: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                                placeholder="e.g. AVANI ENTERPRISES"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300">Signature Image</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const formData = new FormData();
                                                        formData.append('asset', file);
                                                        const response = await api.post('/salary-slips/upload-asset', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        setGenerateForm({ ...generateForm, authorizedSignatoryImage: response.data.filePath });
                                                    }}
                                                    className="hidden"
                                                    id="gen-signatory-upload"
                                                />
                                                <label htmlFor="gen-signatory-upload" className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors">
                                                    Upload
                                                </label>
                                                {generateForm.authorizedSignatoryImage && (
                                                    <img src={resolveAssetUrl(generateForm.authorizedSignatoryImage)} className="h-8 border rounded" alt="Sig" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-[#433020] dark:text-gray-300">Stamp Image</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        const formData = new FormData();
                                                        formData.append('asset', file);
                                                        const response = await api.post('/salary-slips/upload-asset', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        setGenerateForm({ ...generateForm, companyStampImage: response.data.filePath });
                                                    }}
                                                    className="hidden"
                                                    id="gen-stamp-upload"
                                                />
                                                <label htmlFor="gen-stamp-upload" className="cursor-pointer text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors">
                                                    Upload
                                                </label>
                                                {generateForm.companyStampImage && (
                                                    <img src={resolveAssetUrl(generateForm.companyStampImage)} className="h-8 border rounded" alt="Stamp" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Company GST (Optional)</label>
                                        <input
                                            type="text"
                                            value={generateForm.companyGst}
                                            onChange={(e) => setGenerateForm({ ...generateForm, companyGst: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                            placeholder="Enter Company GST"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">
                                            Select Employees (Leave empty for all active employees)
                                        </label>
                                        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-white dark:bg-gray-700">
                                            {employees.map(emp => (
                                                <label key={emp._id} className="flex items-center gap-2 p-2 hover:bg-[#fffbf5] dark:hover:bg-gray-600 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={generateForm.employeeIds.includes(emp._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setGenerateForm({
                                                                    ...generateForm,
                                                                    employeeIds: [...generateForm.employeeIds, emp._id]
                                                                });
                                                            } else {
                                                                setGenerateForm({
                                                                    ...generateForm,
                                                                    employeeIds: generateForm.employeeIds.filter(id => id !== emp._id)
                                                                });
                                                            }
                                                        }}
                                                        className="rounded text-[#8a6144] focus:ring-[#8a6144]"
                                                    />
                                                    <span className="text-[#433020] dark:text-gray-300">{emp.name} ({emp.employeeId})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Notes (Optional)</label>
                                        <textarea
                                            value={generateForm.notes}
                                            onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#433020] dark:text-white focus:ring-2 focus:ring-[#8a6144] focus:border-transparent"
                                            placeholder="Add any notes for this salary period..."
                                        />
                                    </div>
                                </div>
                                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                                    <Button
                                        onClick={() => setShowGenerateModal(false)}
                                        variant="secondary"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGenerateSlips}
                                        variant="brand"
                                    >
                                        Generate
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                                    className="text-2xl font-extrabold text-[#8a6144] dark:text-[#d4a373] text-center bg-[#8a6144]/5 border-b-2 border-dashed border-[#8a6144]/30 hover:border-[#8a6144] focus:border-[#8a6144] focus:outline-none transition-all w-full max-w-md uppercase tracking-wide placeholder-[#8a6144]/40 p-1 rounded-t-lg"
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
                                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
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
                                                <div className="grid grid-cols-[100px_1fr] gap-2 text-sm items-center">
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
                                                <div className="grid grid-cols-[100px_1fr] gap-y-2 gap-x-4 text-sm items-center">
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
                                                                <th className="px-4 py-2 font-medium">Date</th>
                                                                <th className="px-4 py-2 font-medium">Description</th>
                                                                <th className="px-4 py-2 font-medium">Notes</th>
                                                                <th className="px-4 py-2 text-right font-medium">Amount</th>
                                                                <th className="px-2 py-2 w-8"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {editEmployeeExpenses.map((expense, index) => (
                                                                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-4 py-2">
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
                                                                    <td className="px-4 py-2 text-right">
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
                                                                <th className="px-4 py-2 font-medium">Date</th>
                                                                <th className="px-4 py-2 font-medium">Method</th>
                                                                <th className="px-4 py-2 font-medium">Ref ID</th>
                                                                <th className="px-4 py-2 text-right font-medium">Amount</th>
                                                                <th className="px-2 py-2 w-8"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                            {editPayments.map((payment, index) => (
                                                                <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                    <td className="px-4 py-2">
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
                                                                    <td className="px-4 py-2 text-right">
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
            </div>
        </div>
    );
};

export default SalarySlipManagement;
