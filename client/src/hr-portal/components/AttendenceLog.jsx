// src/components/dashboard/AttendanceLog.jsx
import React from 'react';
import { formatDate, formatTime } from "../utils/formatDate.js";

const AttendanceLog = ({ attendance, title = "Attendance History", onEdit, showHeader = true }) => {
    if (!attendance || attendance.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
                {showHeader && (
                    <h3 className="text-2xl font-bold mb-4 text-[#433020] flex items-center justify-center gap-2 border-l-4 border-[#86593a] pl-4">
                        {title}
                    </h3>
                )}
                <p className="text-gray-400 font-medium">No attendance records found.</p>
            </div>
        );
    }

    const statusColors = {
        'Present': 'bg-green-100 text-green-700 font-bold',
        'Half Day': 'bg-orange-100 text-orange-700 font-bold',
        'Holiday': 'bg-[#DDEFFF] text-[#4285F4] font-bold',
        'Absent': 'bg-red-100 text-red-700 font-bold',
    };

    const isEmployeeView = !onEdit;

    return (
        <div className="bg-white rounded-[2rem] p-0 transition-all">
            {showHeader && (
                <h3 className="text-2xl font-bold mb-6 text-[#433020] flex items-center gap-2 border-l-4 border-[#86593a] pl-4">
                    {title}
                </h3>
            )}

            <div className="overflow-x-auto rounded-3xl border border-gray-50 shadow-sm">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-[#FEFAF4]">
                        <tr>
                            <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">DATE</th>
                            {!isEmployeeView && <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">EMPLOYEE</th>}
                            {!isEmployeeView && <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">DEPARTMENT</th>}
                            <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">STATUS</th>
                            <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">CHECK IN</th>
                            <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">CHECK OUT</th>
                            <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">NOTES</th>
                            {onEdit && <th className="px-6 py-5 text-left text-xs font-bold text-[#8D6449] uppercase tracking-widest">ACTIONS</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {attendance.map(record => (
                            <tr key={record._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                <td className="px-6 py-6 whitespace-nowrap text-sm font-semibold text-gray-700">{formatDate(record.date)}</td>
                                {!isEmployeeView && <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-gray-900">{record.employeeId?.name || 'N/A'}</td>}
                                {!isEmployeeView && <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-500 font-medium">{record.employeeId?.department || 'N/A'}</td>}
                                <td className="px-6 py-6 whitespace-nowrap text-sm">
                                    <span className={`px-4 py-1.5 inline-flex text-[10px] leading-5 font-black rounded-full ${statusColors[record.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {record.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-700 font-bold">{record.checkIn ? formatTime(record.checkIn) : 'N/A'}</td>
                                <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-700 font-bold">{record.checkOut ? formatTime(record.checkOut) : 'N/A'}</td>
                                <td className="px-6 py-6 text-sm text-gray-500 italic max-w-xs truncate" title={record.notes}>{record.notes || '-'}</td>
                                {onEdit && (
                                    <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => onEdit(record)} className="bg-[#86593a] text-white px-4 py-1.5 rounded-full text-xs font-black shadow-sm hover:opacity-90 transition-all uppercase tracking-tighter">Edit</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceLog;
