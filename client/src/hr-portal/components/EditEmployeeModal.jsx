import React, { useState, useEffect } from 'react';
import Modal from "../components/Modal.jsx"
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import api from "../api/api.js";

const EditEmployeeModal = ({ isOpen, onClose, employee, onUpdate }) => {
    // Initialize state with default values to prevent uncontrolled input warnings
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        salary: 0,
        joiningDate: '',
        holidaysLeft: 0,
    });

    // When the 'employee' prop changes (i.e., when the modal is opened),
    // populate the form with that employee's data.
    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                department: employee.department || '',
                salary: employee.salary || 0,
                // Format the date for the <input type="date"> field
                joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
                holidaysLeft: employee.holidaysLeft || 0,
            });
        }
    }, [employee]);

    // This is the key function that was not working correctly.
    // It updates the state every time you type in an input field.
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/hr/employees/${employee._id}`, formData);
            onUpdate(); // Refresh the data on the main page
            onClose();  // Close the modal
        } catch (error) {
            console.error("Failed to update employee", error);
            alert("Update failed.");
        }
    };

    if (!employee) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Profile - ${employee.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Name" name="name" value={formData.name} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Department" name="department" value={formData.department} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Salary (₹)" name="salary" type="number" value={formData.salary} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                    <Input label="Holidays Left" name="holidaysLeft" type="number" step="0.5" value={formData.holidaysLeft} onChange={handleChange} className="bg-white/50 dark:bg-gray-700/50 border-[#8a6144]/20 focus:ring-[#8a6144]" />
                </div>
                <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-[#8a6144]/10 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose} className="px-6">Cancel</Button>
                    <Button type="submit" variant="brand" className="px-6">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditEmployeeModal;
