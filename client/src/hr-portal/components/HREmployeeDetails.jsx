// src/components/dashboard/HREmployeeDetails.js
import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import AttendanceLog from "../components/AttendenceLog.jsx";
import EditAttendanceModal from './EditAttendanceModal.jsx'; // A new component

const HREmployeeDetails = ({ employee, attendance, onUpdate }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Employee Info Card */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800">{employee.name}</h3>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p className="break-all"><span className="font-semibold">Email:</span> {employee.email}</p>
                    <p><span className="font-semibold">Phone:</span> {employee.phone || 'N/A'}</p>
                    <p><span className="font-semibold">DOB:</span> {new Date(employee.dob).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Holidays Left:</span> {employee.holidaysLeft}</p>
                    <p className="sm:col-span-2 break-words"><span className="font-semibold">Address:</span> {employee.address || 'N/A'}</p>
                </div>
            </Card>

            {/* Attendance Log */}
            <AttendanceLog
                attendance={attendance}
                title={`${employee.name}'s Attendance`}
                onEdit={handleEditClick} // Pass the edit handler
            />

            {/* Edit Modal */}
            {selectedRecord && (
                <EditAttendanceModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    record={selectedRecord}
                    onUpdate={onUpdate} // Pass the refresh function to the modal
                />
            )}
        </div>
    );
};

export default HREmployeeDetails;
