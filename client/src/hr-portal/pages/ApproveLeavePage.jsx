// import React, { useState, useEffect } from 'react';
// import api from "../api/api.js"
// import Spinner from '../components/Spinner.jsx';
// import Button from '../components/Button.jsx';
// import { formatDate } from '../utils/formatDate.js';

// const ApproveLeavePage = () => {
//     const [pendingLeaves, setPendingLeaves] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchPendingLeaves = async () => {
//         try {
//             setLoading(true);
//             const { data } = await api.get('/hr/leaves/pending');
//             setPendingLeaves(data);
//         } catch (error) {
//             console.error("Failed to fetch pending leaves", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchPendingLeaves();
//     }, []);

//     const handleUpdateStatus = async (id, status) => {
//         try {
//             await api.put(`/hr/leaves/${id}/status`, { status });
//             // Remove the processed leave from the list
//             setPendingLeaves(pendingLeaves.filter(leave => leave._id !== id));
//         } catch (error) {
//             console.error("Failed to update leave status", error);
//             alert("Action failed. Please try again.");
//         }
//     };

//     if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

//     return (
//         <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-800">Approve Leave Requests</h1>
//             {pendingLeaves.length > 0 ? (
//                 <div className="space-y-4">
//                     {pendingLeaves.map(leave => (
//                         <div key={leave._id} className="bg-white p-6 rounded-lg shadow-md">
//                             <div className="flex justify-between items-start">
//                                 <div>
//                                     <p className="font-bold text-lg">{leave.employeeId.name} <span className="text-sm font-normal text-gray-500">({leave.employeeId.employeeId})</span></p>
//                                     <p className="text-sm text-gray-600">{leave.employeeId.department}</p>
//                                 </div>
//                                 <p className="font-semibold">Leave Date: {formatDate(leave.leaveDate)}</p>
//                             </div>
//                             <div className="mt-4 border-t pt-4">
//                                 <p className="text-sm text-gray-700 whitespace-pre-wrap">{leave.reason}</p>
//                             </div>
//                             <div className="mt-4 flex justify-end space-x-2">
//                                 <Button onClick={() => handleUpdateStatus(leave._id, 'Declined')} variant="danger">Decline</Button>
//                                 <Button onClick={() => handleUpdateStatus(leave._id, 'Approved')}>Approve</Button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p className="text-center text-gray-500">No pending leave requests.</p>
//             )}
//         </div>
//     );
// };

// export default ApproveLeavePage;

import React, { useState, useEffect } from 'react';
import api from "../api/api.js";
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';
import { formatDate } from '../utils/formatDate.js';
import toast, { Toaster } from 'react-hot-toast';

const ApproveLeavePage = () => {
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    const fetchPendingLeaves = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/hr/leaves/pending');
            setPendingLeaves(data);
        } catch (error) {
            console.error("Failed to fetch pending leaves", error);
            toast.error("Failed to load leave requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingLeaves();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        setProcessingId(id);
        setProcessingAction(status);
        try {
            await api.put(`/hr/leaves/${id}/status`, { status });
            setPendingLeaves(pendingLeaves.filter(leave => leave._id !== id));
            toast.success(`Leave request ${status === 'Approved' ? 'approved' : 'declined'} successfully!`);
        } catch (error) {
            console.error("Failed to update leave status", error);
            toast.error("Action failed. Please try again.");
        } finally {
            setProcessingId(null);
            setProcessingAction(null);
        }
    };

    if (loading) return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
    );

    return (
        <>
            <Toaster position="top-right" />
            <div className="space-y-8 p-8 -m-4 md:-m-8 min-h-[calc(100vh-100px)] rounded-xl bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
                <h1 className="text-4xl font-extrabold text-center text-[#433020] dark:text-gray-100 mb-8 mt-4 drop-shadow-sm">📋 Approve Leave Requests</h1>
                {pendingLeaves.length === 0 ? (
                    <p className="text-center text-[#8a6144] dark:text-gray-400 text-lg">No pending leave requests.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingLeaves.map((leave, index) => (
                            <div
                                key={leave._id}
                                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 p-6 border border-white/50 dark:border-gray-700 hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30 transform transition duration-300 ease-in-out animate-fade-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-lg font-bold text-[#433020] dark:text-gray-100 whitespace-nowrap">
                                            {leave.employeeId.name}
                                            <span className="text-sm font-normal text-[#8a6144] dark:text-gray-400"> ({leave.employeeId.employeeId})</span>
                                        </p>
                                        <p className="text-sm text-[#8a6144] dark:text-gray-400">{leave.employeeId.department}</p>
                                    </div>
                                    <span className="bg-[#f5e6d3] dark:bg-gray-700 text-[#433020] dark:text-gray-200 text-[10px] md:text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                        {formatDate(leave.leaveDate)}
                                    </span>
                                </div>

                                <div className="bg-[#fffbf5] dark:bg-gray-700/50 p-4 rounded-xl border border-[#8a6144]/10 dark:border-gray-600 mb-6">
                                    <p className="text-[#433020] dark:text-gray-200 text-sm whitespace-pre-wrap">{leave.reason}</p>
                                </div>

                                <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-[#8a6144]/10">
                                    <Button
                                        onClick={() => handleUpdateStatus(leave._id, 'Declined')}
                                        variant="danger"
                                        disabled={processingId === leave._id}
                                        className="min-w-[100px] rounded-full shadow-lg shadow-red-500/20 py-2.5 font-bold uppercase tracking-wider text-xs"
                                    >
                                        {processingId === leave._id && processingAction === 'Declined' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Declining...
                                            </span>
                                        ) : 'Decline'}
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                                        variant="brand"
                                        disabled={processingId === leave._id}
                                        className="min-w-[100px] rounded-full shadow-lg shadow-[#8a6144]/20 py-2.5 font-bold uppercase tracking-wider text-xs bg-[#8a6144] hover:bg-[#6b4d36] text-white"
                                    >
                                        {processingId === leave._id && processingAction === 'Approved' ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Approving...
                                            </span>
                                        ) : 'Approve'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default ApproveLeavePage;

