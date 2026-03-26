const fs = require('fs');

const srcPath = 'd:/team-lead-main/client/src/hr-portal/pages/SalarySlipManagement.jsx';
const dstPath = 'd:/team-lead-main/client/src/pages/hr-admin/SalarySlipManagement.jsx';

const srcCode = fs.readFileSync(srcPath, 'utf8');

// The exact string to capture: from '{/* Edit Modal */}' to '</Layout>' or last render.
// Look for '{/* Edit Modal */}'
const editModalStart = srcCode.indexOf('{/* Edit Modal */}');
// Read until next semantic stop or end
const deleteConfirmationStart = srcCode.indexOf('{/* Delete Confirmation Modal */}');
const followingElementBound = deleteConfirmationStart !== -1 ? deleteConfirmationStart : srcCode.indexOf('</AnimatePresence>', editModalStart + 100) + 18;

const editModalFragment = srcCode.substring(editModalStart, followingElementBound);

// Extract helper methods
const getMethod = (name) => {
    const s = srcCode.indexOf('const ' + name + ' = ');
    if (s === -1) return '';
    let braces = 0, started = false, i = s;
    while(i < srcCode.length) {
        if (srcCode[i] === '{') { started = true; braces++; }
        if (srcCode[i] === '}') { 
            braces--; 
            if (started && braces === 0) return srcCode.substring(s, i+1) + '\n';
        }
        i++;
    }
    return '';
};

const methods = ['addAdjustment', 'removeAdjustment', 'updateAdjustment', 'addPayment', 'removePayment', 'updatePayment', 'addEmployeeExpense', 'removeEmployeeExpense', 'updateEmployeeExpense', 'calculateNetSalary', 'handleUploadAsset', 'handlePrefillLatest']
    .map(getMethod).join('\n');


// Build the pristine target file content using what I know from Step 533
let dstBase = `import React, { useState, useEffect } from 'react';
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
    if (/^(https?:)?\\/\\//i.test(assetPath) || assetPath.startsWith('data:')) {
        return assetPath;
    }
    const normalizedPath = assetPath.startsWith('/') ? assetPath : \`/\${assetPath}\`;
    return \`\${BACKEND_BASE_URL}\${normalizedPath}\`;
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

            const response = await api.get(\`/salary-slips?\${params}\`);
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
            await api.put(\`/salary-slips/\${selectedSlip._id}\`, {
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
            await api.delete(\`/salary-slips/\${id}\`);
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
            const content = \`
                <!DOCTYPE html>
                <html><head><title>Salary Slip - \${slip.employeeName}</title></head>
                <body><h3>Slip - \${slip.employeeName}</h3><script>window.print()</script></body></html>\`;
            printWindow.document.write(content); printWindow.document.close();
    };

    ${methods}

    if (loading) return (
        <Layout title="Salary Slips">
            <div className="flex justify-center items-center h-64"><Spinner /></div>
        </Layout>
    );

    return (
        <Layout title="Salary Slip Management">
            <div className="space-y-8">
                {/* Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-wrap gap-6 items-center justify-between animate-fade-in max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 px-4 rounded-xl border border-[#8a6144]/10">
                            <FiCalendar className="text-[#8a6144]" />
                            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-transparent text-sm font-bold text-[#433020] dark:text-gray-100 outline-none cursor-pointer">
                                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 px-4 rounded-xl border border-[#8a6144]/10">
                            <input type="number" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-transparent text-sm font-bold text-[#433020] dark:text-gray-100 outline-none w-16" />
                        </div>
                        <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 px-4 rounded-xl border border-[#8a6144]/10">
                            <FiFilter className="text-[#8a6144]" />
                            <select value={filterApproved} onChange={(e) => setFilterApproved(e.target.value)} className="bg-transparent text-sm font-bold text-[#433020] dark:text-gray-100 outline-none cursor-pointer">
                                <option value="all">Every Status</option>
                                <option value="true">Approved Only</option>
                                <option value="false">Pending Only</option>
                            </select>
                        </div>
                        <Button onClick={() => setShowGenerateModal(true)} variant="brand" className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold">
                            <FiPlus /> Bulk Generate Menu
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {salarySlips.map(slip => (
                        <motion.div key={slip._id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/50 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all group">
                            <div className="bg-[#8a6144] p-6 text-white text-center relative">
                                {!slip.isApproved && (
                                    <input type="checkbox" checked={selectedSlipIds.includes(slip._id)} onChange={() => handleSelectSlip(slip._id)} className="absolute left-6 top-7 w-5 h-5 cursor-pointer accent-[#fff]" />
                                )}
                                <h3 className="font-black text-xl italic uppercase tracking-tighter">{slip.employeeName}</h3>
                                <p className="text-[10px] font-bold opacity-60 uppercase mt-1">{slip.employeeCode} <span className="mx-1">•</span> {slip.department}</p>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8 bg-[#fffbf5] dark:bg-gray-700/50 p-6 rounded-3xl border border-[#8a6144]/10 shadow-inner">
                                    <div className="text-center flex-1">
                                        <p className="text-[9px] font-black text-[#8a6144] uppercase tracking-widest mb-1 opacity-60">Net Salary</p>
                                        <p className="text-3xl font-black text-green-600 italic">₹{slip.netSalary.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center flex-1">
                                        <p className={\`text-[10px] font-bold uppercase py-1 px-3 rounded-full inline-block \${slip.paymentStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                                            slip.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }\`}>
                                            {slip.paymentStatus || 'Pending'}
                                        </p>
                                        {slip.balanceDue > 0 && (
                                            <p className="text-xs text-red-500 font-bold mt-1 uppercase tracking-tight">Due: ₹{slip.balanceDue?.toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <Button onClick={() => handleEditSlip(slip)} variant="brand" className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-md">
                                        Modify Slip
                                    </Button>
                                    <Button onClick={() => handleDownloadPDF(slip)} className="bg-[#433020] hover:bg-black text-white py-3 px-6 rounded-2xl shadow-md border-none">
                                        <FiDownload size={18} />
                                    </Button>
                                    <Button onClick={() => handleDeleteSlip(slip._id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-2xl">
                                        <FiTrash2 size={18} className="text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Generated Code Insert */}
            ${editModalFragment}

            <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} title="Generate Slips (Redirecting...)">
                <div className="space-y-6 text-center py-4">
                    <p className="font-bold text-[#8a6144] bg-[#fffbf5] p-6 rounded-xl border border-[#8a6144]/10 italic">Please use the new standalone Generate Salary Slips dashboard.</p>
                    <Button onClick={() => { navigate('/hr-admin/generate-slips'); setShowGenerateModal(false); }} variant="brand" className="px-10 rounded-full font-black uppercase tracking-widest text-[12px] shadow-lg">Go to Generator Page</Button>
                </div>
            </Modal>

        </Layout>
    );
};
export default SalarySlipManagement;
`;

fs.writeFileSync(dstPath, dstBase, 'utf8');
console.log('Restored perfectly!');
