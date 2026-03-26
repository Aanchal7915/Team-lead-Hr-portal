import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Upload, Trash2, FileText, Plus, X, CheckCircle } from 'lucide-react';
import moment from 'moment';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const AdminSalarySlips = () => {
    const [slips, setSlips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [formData, setFormData] = useState({
        employeeId: '', month: 'January', year: String(currentYear), amount: '', status: 'Paid'
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [slipsRes, empRes] = await Promise.all([
                fetch('/api/salary-slips', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
                fetch('/api/hr/employees', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            ]);
            const slipsData = await slipsRes.json();
            const empData = await empRes.json();

            if (slipsData.success) setSlips(slipsData.data || []);
            if (empData.success) setEmployees(empData.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSlips([]);
            setEmployees([
                { id: '1', name: 'John Doe' },
                { id: '2', name: 'Jane Smith' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) { alert('Please select a PDF file.'); return; }
        if (!formData.employeeId) { alert('Please select an employee.'); return; }

        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('file', file);
            fd.append('employeeId', formData.employeeId);
            fd.append('month', `${formData.month} ${formData.year}`);
            fd.append('amount', formData.amount);
            fd.append('status', formData.status);

            const res = await fetch('/api/salary-slips', {
                method: 'POST',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFile(null);
                setFormData({ employeeId: '', month: 'January', year: String(currentYear), amount: '', status: 'Paid' });
                fetchData();
            } else {
                alert(data.message || 'Failed to upload slip');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this salary slip?')) return;
        try {
            const res = await fetch(`/api/salary-slips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) fetchData();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <Layout title="Salary Slips Management">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[#3E2723]">Salary Slips</h2>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">Upload and manage employee salary slips</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#3E2723] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#5D4037] transition font-bold text-sm shadow-md"
                    >
                        <Plus className="w-4 h-4" /> Upload Salary Slip
                    </button>
                </div>

                {/* Filter by Employee */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter by Employee:</label>
                    <select
                        value={selectedEmployee}
                        onChange={e => setSelectedEmployee(e.target.value)}
                        className="border-2 border-gray-100 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-[#3E2723] transition shadow-sm"
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.id || emp._id} value={emp.id || emp._id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                {/* Slips Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {['Employee', 'Month', 'Amount', 'Status', 'Uploaded On', 'Actions'].map(h => (
                                    <th key={h} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-400 font-medium">Loading...</td></tr>
                            ) : slips.filter(s => !selectedEmployee || (s.employee?._id === selectedEmployee || s.employee?.id === selectedEmployee)).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-12">
                                        <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-400 font-medium">No salary slips found.</p>
                                    </td>
                                </tr>
                            ) : slips
                                .filter(s => !selectedEmployee || (s.employee?._id === selectedEmployee))
                                .map(slip => (
                                    <tr key={slip._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs">
                                                    {slip.employee?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{slip.employee?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">{slip.employee?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-700 text-sm">{slip.month}</td>
                                        <td className="p-4 font-bold text-gray-900 text-sm">{typeof slip.amount === 'number' ? `₹ ${slip.amount.toLocaleString()}` : slip.amount}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${slip.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {slip.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-bold text-gray-400">{moment(slip.createdAt).format('MMM DD, YYYY')}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <a 
                                                    href={slip.documentUrl} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View PDF"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => handleDelete(slip._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Upload Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-xl font-bold text-[#3E2723] flex items-center gap-2">
                                    <Upload className="w-5 h-5" /> Upload Salary Slip
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpload} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Employee</label>
                                    <select
                                        required
                                        value={formData.employeeId}
                                        onChange={e => setFormData({...formData, employeeId: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-[#3E2723] outline-none font-medium text-sm shadow-sm"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id || emp._id} value={emp.id || emp._id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Month</label>
                                        <select
                                            value={formData.month}
                                            onChange={e => setFormData({...formData, month: e.target.value})}
                                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-[#3E2723] outline-none font-medium text-sm shadow-sm"
                                        >
                                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Year</label>
                                        <select
                                            value={formData.year}
                                            onChange={e => setFormData({...formData, year: e.target.value})}
                                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-[#3E2723] outline-none font-medium text-sm shadow-sm"
                                        >
                                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Net Salary Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 45000"
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-[#3E2723] outline-none font-medium text-sm shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 focus:border-[#3E2723] outline-none font-medium text-sm shadow-sm"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">PDF File</label>
                                    <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#3E2723] hover:bg-gray-100'}`}>
                                        <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                        {file ? (
                                            <>
                                                <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                                                <p className="text-xs font-bold text-green-700 truncate max-w-[200px]">{file.name}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                <p className="text-xs font-bold text-gray-400">Click to select PDF</p>
                                                <p className="text-[10px] text-gray-300">Max 10MB</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-50">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold transition-colors text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={uploading} className="px-5 py-2.5 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-xl font-bold flex items-center gap-2 transition-colors text-sm shadow-md disabled:opacity-60">
                                        <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminSalarySlips;
