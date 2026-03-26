import React, { useState, useEffect } from 'react';
import api from '../../hr-portal/api/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiCalendar, FiDollarSign, FiFileText, FiEye, FiX } from 'react-icons/fi';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Button from '../../hr-portal/components/Button.jsx';
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

const EmployeeSalarySlips = () => {
    const [salarySlips, setSalarySlips] = useState([]);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [loading, setLoading] = useState(true);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchSalarySlips();
    }, []);

    const fetchSalarySlips = async () => {
        try {
            setLoading(true);
            const response = await api.get('/employee/salary-slips');
            setSalarySlips(response.data);
        } catch (error) {
            console.error('Error fetching salary slips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = (slip) => {
        // Create a printable version
        const printWindow = window.open('', '_blank');
        const content = generatePDFContent(slip);
        printWindow.document.write(content);
        printWindow.document.close();

        // Wait for logo to load before printing
        const logoImg = printWindow.document.querySelector('.logo');
        if (logoImg) {
            logoImg.onload = () => {
                setTimeout(() => printWindow.print(), 100);
            };
            logoImg.onerror = () => {
                // If logo fails to load, print anyway
                setTimeout(() => printWindow.print(), 100);
            };
        } else {
            setTimeout(() => printWindow.print(), 100);
        }
    };

    const generatePDFContent = (slip) => {

        const totalPaid = (slip.payments || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);
        const latestPayment = slip.payments && slip.payments.length > 0 ? slip.payments[slip.payments.length - 1] : {};
        const signatoryImageUrl = resolveAssetUrl(slip.authorizedSignatoryImage);
        const stampImageUrl = resolveAssetUrl(slip.companyStampImage);

        return `
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
    };

    if (loading) return (
        <Layout title="My Salary Slips">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    return (
        <Layout title="My Salary Slips">
            <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl md:text-4xl font-extrabold text-[#433020] dark:text-white mb-2 drop-shadow-sm tracking-tight">
                        My <span className="text-[#8a6144]">Salary Slips</span>
                    </h1>
                    <p className="text-[#8a6144] dark:text-gray-400">View and download your approved salary slips</p>
                </motion.div>

                {/* Salary Slips Grid */}
                {salarySlips.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl p-12 text-center border border-white/50"
                    >
                        <FiFileText className="text-6xl text-[#8a6144]/30 mx-auto mb-4" />
                        <p className="text-[#433020] dark:text-gray-300 text-lg">No salary slips available yet</p>
                        <p className="text-[#8a6144] dark:text-gray-400 mt-2">Your approved salary slips will appear here</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {salarySlips.map((slip, index) => (
                            <motion.div
                                key={slip._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/50"
                                onClick={() => setSelectedSlip(slip)}
                            >
                                <div className="bg-[#8a6144] p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiCalendar className="text-xl" />
                                        <h3 className="text-xl font-bold">
                                            {months[slip.month - 1]} {slip.year}
                                        </h3>
                                    </div>
                                    <p className="text-white/80 text-sm">{slip.department}</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#8a6144] dark:text-gray-400">Base Salary</span>
                                            <span className="font-medium text-[#433020] dark:text-gray-100">₹{slip.baseSalary.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-[#8a6144] dark:text-gray-400">Net Salary</span>
                                                <span className="text-xl font-bold text-[#433020] dark:text-gray-100">₹{slip.netSalary.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-green-600">Paid: ₹{(slip.totalPaid || 0).toLocaleString()}</span>
                                                {slip.balanceDue > 0 ? (
                                                    <span className="text-red-500 font-bold">Due: ₹{slip.balanceDue.toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-green-600 font-bold">Fully Paid</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            onClick={() => setSelectedSlip(slip)}
                                            variant="secondary"
                                            className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                        >
                                            <FiEye /> View Slip
                                        </Button>
                                        <Button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownloadPDF(slip);
                                            }}
                                            variant="brand"
                                            className="flex-1 flex items-center justify-center gap-1 text-xs md:text-sm py-2"
                                        >
                                            <FiDownload className="text-sm" /> <span className="text-[10px] md:text-sm">Download PDF</span>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                <AnimatePresence>
                    {selectedSlip && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setSelectedSlip(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 dark:border-gray-700"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-[#8a6144] dark:bg-gray-700 p-4 md:p-6 text-white relative">
                                    <button
                                        onClick={() => setSelectedSlip(null)}
                                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                    <h2 className="text-xl md:text-2xl font-bold">Salary Slip Details</h2>
                                    <p className="text-white/80 mt-1">
                                        {months[selectedSlip.month - 1]} {selectedSlip.year}
                                    </p>
                                </div>
                                <div className="p-4 md:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs md:text-sm text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Employee Name</p>
                                            <p className="font-bold text-[#433020] dark:text-gray-100">{selectedSlip.employeeName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Employee ID</p>
                                            <p className="font-bold text-[#433020] dark:text-gray-100">{selectedSlip.employeeCode}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Department</p>
                                            <p className="font-bold text-[#433020] dark:text-gray-100">{selectedSlip.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm text-[#8a6144] dark:text-gray-400 uppercase tracking-wider">Salary Period</p>
                                            <p className="font-bold text-[#433020] dark:text-gray-100">
                                                {months[selectedSlip.month - 1]} {selectedSlip.year}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl mb-6">
                                            <h3 className="text-sm font-bold text-[#8a6144] dark:text-gray-400 mb-3 uppercase tracking-wider">Company & Bank Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Company Name</p>
                                                    <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.companyName || 'Avani Enterprises'}</p>
                                                </div>
                                                {selectedSlip.companyGst && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Company GST</p>
                                                        <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.companyGst}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Bank Name</p>
                                                    <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.employeeBankDetails?.bankName || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Account Number</p>
                                                    <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.employeeBankDetails?.accountNumber || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">IFSC Code</p>
                                                    <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.employeeBankDetails?.ifscCode || '-'}</p>
                                                </div>
                                                {selectedSlip.employeeBankDetails?.panCardNumber && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">PAN Card</p>
                                                        <p className="font-medium text-[#433020] dark:text-white">{selectedSlip.employeeBankDetails.panCardNumber}</p>
                                                    </div>
                                                )}
                                                {selectedSlip.employeeBankDetails?.upiId && (
                                                    <div className="bg-[#fffbf5] p-2 rounded border border-[#8a6144]/20 mt-1">
                                                        <p className="text-[10px] text-[#8a6144] uppercase font-bold">Credit to UPI ID</p>
                                                        <p className="font-bold text-[#8a6144]">{selectedSlip.employeeBankDetails.upiId}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-[#433020] dark:text-white mb-4">Salary Breakdown</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <span className="text-[#433020] dark:text-gray-300">Base Salary</span>
                                                <span className="font-medium text-[#433020] dark:text-gray-100">₹{selectedSlip.baseSalary.toLocaleString()}</span>
                                            </div>

                                            {selectedSlip.adjustments && selectedSlip.adjustments.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Adjustments</p>
                                                    {selectedSlip.adjustments.map((adj, index) => (
                                                        <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-2">
                                                            <span className="text-[#433020] dark:text-gray-300">{adj.description}</span>
                                                            <span className={`font-medium ${adj.type === 'addition' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {adj.type === 'addition' ? '+' : '-'}₹{adj.amount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {selectedSlip.employeeExpenses && selectedSlip.employeeExpenses.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-[#433020] dark:text-gray-300 mb-2">Employee Expenses (Reimbursement)</p>
                                                    {selectedSlip.employeeExpenses.map((expense, index) => (
                                                        <div key={index} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-2 border border-green-200 dark:border-green-800">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <span className="text-[#433020] dark:text-gray-300 font-medium">{expense.description}</span>
                                                                    {expense.notes && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">{expense.notes}</p>
                                                                    )}
                                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                        {new Date(expense.date).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                                    +₹{expense.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center bg-[#fffbf5] dark:bg-gray-700/50 p-4 rounded-lg border-2 border-green-200 dark:border-green-800 mt-4">
                                                <span className="text-lg font-bold text-[#433020] dark:text-gray-100">Net Salary</span>
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{selectedSlip.netSalary.toLocaleString()}</span>
                                            </div>

                                            {/* Payment History & Status */}
                                            <div className="mt-6">
                                                <h3 className="text-lg font-bold text-[#433020] dark:text-white mb-4">Payment History</h3>

                                                {selectedSlip.payments && selectedSlip.payments.length > 0 ? (
                                                    <div className="space-y-2 mb-4">
                                                        {selectedSlip.payments.map((payment, idx) => (
                                                            <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                                                                <div>
                                                                    <p className="font-medium text-sm text-[#433020] dark:text-gray-200">{payment.method}</p>
                                                                    <p className="text-[10px] text-gray-500">{new Date(payment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                                    {payment.referenceId && <p className="text-[10px] text-gray-400">Ref: {payment.referenceId}</p>}
                                                                </div>
                                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                                    ₹{parseFloat(payment.amount).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4">No payments recorded yet.</p>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Total Paid</p>
                                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                            ₹{((selectedSlip.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Balance Due</p>
                                                        <p className={`text-xl font-bold ${Math.max(0, selectedSlip.netSalary - (selectedSlip.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                            ₹{Math.max(0, selectedSlip.netSalary - (selectedSlip.payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedSlip.notes && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h3 className="text-lg font-bold text-[#433020] dark:text-white mb-2">Notes</h3>
                                            <p className="text-[#433020] dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{selectedSlip.notes}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                                    <Button
                                        onClick={() => setSelectedSlip(null)}
                                        variant="secondary"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => handleDownloadPDF(selectedSlip)}
                                        variant="brand"
                                        className="flex items-center gap-2"
                                    >
                                        <FiDownload /> Download PDF
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            </div>
        </Layout>
    );
};

export default EmployeeSalarySlips;
