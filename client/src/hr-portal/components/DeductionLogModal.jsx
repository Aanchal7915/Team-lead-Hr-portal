// src/components/dashboard/DeductionLogModal.js
import React from 'react';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';

const DeductionLogModal = ({ isOpen, onClose, logData }) => {
    if (!logData) return null;

    // --- FIX: Add a safety check for the deductionLog array ---
    // This ensures that even if the backend sends no log, the component won't crash.
    const logs = logData.deductionLog || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Deduction Log for ${logData.employeeName}`}>
            <div className="overflow-y-auto max-h-[60vh]">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs.length > 0 ? logs.map((log, index) => (
                            <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{log.date}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{log.reason}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-red-600">
                                    {log.amount.toLocaleString()}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="3" className="px-4 py-4 text-center text-gray-500">No deductions for this month.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mt-4">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </Modal>
    );
};

export default DeductionLogModal;
