import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../hr-portal/components/Button.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Layout from '../../components/Layout';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const resolveAssetUrl = (assetPath) => {
    if (!assetPath) return '';
    if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith('data:')) {
        return assetPath;
    }
    const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
    return `${BACKEND_BASE_URL}${normalizedPath}`;
};

const GenerateSalarySlips = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [latestCompanyInfo, setLatestCompanyInfo] = useState(null);

    const [uploadingSig, setUploadingSig] = useState(false);
    const [uploadingStamp, setUploadingStamp] = useState(false);

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

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchEmployees();
        fetchLatestInfo();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await api.get('/hr/employees');
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestInfo = async () => {
        try {
            const response = await api.get('/salary-slips/latest-info');
            const data = response.data?.data || response.data;
            setLatestCompanyInfo(data);
            return data;
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
            navigate('/hr-admin/salary-slips');
        } catch (error) {
            console.error('Error generating slips:', error);
            alert(error.response?.data?.message || 'Failed to generate salary slips');
        }
    };

    if (loading) return (
        <Layout title="Generate Salary Slips">
            <div className="flex justify-center items-center h-64"><Spinner /></div>
        </Layout>
    );

    return (
        <Layout title="Generate Salary Slips">
            <div className="flex justify-center items-center p-4 min-h-[calc(100vh-200px)]">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 dark:border-gray-700 mx-auto"
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
                                                alert('Failed to upload signature. ' + (error.response?.data?.message || ''));
                                            } finally {
                                                setUploadingSig(false);
                                                e.target.value = null; // allow re-upload
                                            }
                                        }}
                                        className="hidden"
                                        id="gen-signatory-upload"
                                        disabled={uploadingSig}
                                    />
                                    <label 
                                        htmlFor={uploadingSig ? "" : "gen-signatory-upload"} 
                                        className={`cursor-pointer text-xs px-4 py-2 rounded-lg border transition-all flex items-center gap-2 font-semibold ${uploadingSig ? 'bg-gray-200 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-[#fffbf5] text-[#8a6144] border-[#8a6144]/30 shadow-sm dark:bg-gray-700 dark:text-gray-300'}`}
                                    >
                                        {uploadingSig ? (
                                            <><div className="w-3 h-3 border-2 border-[#8a6144]/30 border-t-[#8a6144] rounded-full animate-spin"></div> Uploading...</>
                                        ) : 'Upload Signature'}
                                    </label>
                                    {generateForm.authorizedSignatoryImage && !uploadingSig && (
                                        <div className="relative group">
                                            <img src={resolveAssetUrl(generateForm.authorizedSignatoryImage)} className="h-10 object-contain p-1 border border-green-200 bg-green-50/50 dark:bg-gray-700 rounded-lg" alt="Sig" />
                                            <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-[#433020] dark:text-gray-300">Stamp Image</label>
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
                                                alert('Failed to upload stamp. ' + (error.response?.data?.message || ''));
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
                                        className={`cursor-pointer text-xs px-4 py-2 rounded-lg border transition-all flex items-center gap-2 font-semibold ${uploadingStamp ? 'bg-gray-200 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-[#fffbf5] text-[#8a6144] border-[#8a6144]/30 shadow-sm dark:bg-gray-700 dark:text-gray-300'}`}
                                    >
                                        {uploadingStamp ? (
                                            <><div className="w-3 h-3 border-2 border-[#8a6144]/30 border-t-[#8a6144] rounded-full animate-spin"></div> Uploading...</>
                                        ) : 'Upload Stamp'}
                                    </label>
                                    {generateForm.companyStampImage && !uploadingStamp && (
                                        <div className="relative group">
                                            <img src={resolveAssetUrl(generateForm.companyStampImage)} className="h-10 object-contain p-1 border border-green-200 bg-green-50/50 dark:bg-gray-700 rounded-lg" alt="Stamp" />
                                            <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </span>
                                        </div>
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
                            onClick={() => navigate('/hr-admin/salary-slips')}
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
            </div>
        </Layout>
    );
};

export default GenerateSalarySlips;
