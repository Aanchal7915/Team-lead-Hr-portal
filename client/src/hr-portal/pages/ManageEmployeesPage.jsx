// import React, { useState, useEffect } from 'react';
// import api from "../api/api.js"
// import Spinner from '../components/Spinner.jsx';
// import EditEmployeeModal from "../components/EditEmployeeModal.jsx"
// import { formatDate } from '../utils/formatDate.js';
// import Button from '../components/Button.jsx';



// const EmployeeCard = ({ employee, onEdit, onDelete }) => {
//     return (
//         <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
//             <div className="flex items-center space-x-4 mb-4">
//                 <img src={employee.profilePictureUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`} alt={employee.name} className="w-16 h-16 rounded-full object-cover" />
//                 <div>
//                     <h3 className="text-xl font-bold text-gray-800">{employee.name}</h3>
//                     <p className="text-sm text-gray-500">{employee.employeeId}</p>
//                     <p className="text-sm text-blue-600 font-semibold">{employee.department}</p>
//                 </div>
//             </div>
//             <div className="space-y-2 text-sm flex-grow">
//                 <p><span className="font-semibold">Email:</span> {employee.email}</p>
//                 <p><span className="font-semibold">Phone:</span> {employee.phone || 'N/A'}</p>
//                 <p><span className="font-semibold">Joining Date:</span> {employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'}</p>
//                 <p><span className="font-semibold">Salary:</span> ₹{employee.salary.toLocaleString()}</p>
//                 <p><span className="font-semibold">Leaves Left:</span> {employee.holidaysLeft}</p>
//                 <div>
//                     <h4 className="font-semibold mt-2">Documents:</h4>
//                     <ul className="list-disc list-inside pl-4">
//                         {employee.idProofUrl && <li><a href={employee.idProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">ID Proof</a></li>}
//                         {employee.documents && employee.documents.map((doc, i) => (
//                             <li key={i}><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{doc.name}</a></li>
//                         ))}
//                         {!employee.idProofUrl && (!employee.documents || employee.documents.length === 0) && <li className="text-gray-400">No documents uploaded</li>}
//                     </ul>
//                 </div>
//             </div>
//             <div className="mt-6 flex justify-end space-x-2">
//                 <Button onClick={() => onEdit(employee)} variant="secondary">Edit</Button>
//                 <Button onClick={() => onDelete(employee)} variant="danger">Delete</Button>
//             </div>
//         </div>
//     );
// };


// const ManageEmployeesPage = () => {
//     const [employees, setEmployees] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//     const [isModalOpen, setModalOpen] = useState(false);

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             // This API call now automatically triggers the leave reset check on the backend
//             const { data } = await api.get('/hr/employees');
//             setEmployees(data);
//         } catch (error) {
//             console.error("Failed to fetch employees", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const filteredEmployees = employees.filter(emp =>
//         emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
//     );

//     const handleEdit = (employee) => {
//         setSelectedEmployee(employee);
//         setModalOpen(true);
//     };

//     const handleDelete = async (employee) => {
//         if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
//             try {
//                 await api.delete(`/hr/employees/${employee._id}`);
//                 fetchData(); // Refresh the list after deleting
//             } catch (error) {
//                 console.error("Failed to delete employee", error);
//                 alert("Could not delete employee.");
//             }
//         }
//     };

//     if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

//     return (
//         <div className="space-y-6">
//             <div className="flex flex-wrap justify-between items-center gap-4">
//                 <h1 className="text-3xl font-bold text-gray-800">Manage Employees</h1>
//                 {/* The "Reset Monthly Leaves" button has been removed as this is now automatic */}
//             </div>
//             <input
//                 type="text"
//                 placeholder="Search by name or ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-lg"
//             />
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredEmployees.map(emp => (
//                     <EmployeeCard key={emp._id} employee={emp} onEdit={handleEdit} onDelete={handleDelete} />
//                 ))}
//             </div>
//             {selectedEmployee && (
//                 <EditEmployeeModal
//                     isOpen={isModalOpen}
//                     onClose={() => setModalOpen(false)}
//                     employee={selectedEmployee}
//                     onUpdate={fetchData}
//                 />
//             )}
//         </div>
//     );
// };

// export default ManageEmployeesPage;

import React, { useState, useEffect } from 'react';
import api from "../api/api.js";
import Spinner from '../components/Spinner.jsx';
import EditEmployeeModal from "../components/EditEmployeeModal.jsx";
import { formatDate } from '../utils/formatDate.js';
import Button from '../components/Button.jsx';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/50 dark:border-gray-700 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
            <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                    <img
                        src={employee.profilePictureUrl || `https://ui-avatars.com/api/?name=${employee.name}&background=random`}
                        alt={employee.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#8a6144]/20 p-1 transition-transform duration-300 hover:scale-110"
                    />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-[#433020] dark:text-gray-100">{employee.name}</h3>
                    <p className="text-sm font-medium text-[#8a6144] dark:text-gray-400">{employee.employeeId}</p>
                    <p className="text-sm text-[#8a6144] font-bold uppercase tracking-wider">{employee.department}</p>
                </div>
            </div>

            <div className="space-y-2 text-sm text-[#433020] dark:text-gray-200">
                <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 rounded-lg border border-[#8a6144]/10 dark:border-gray-600">
                    <span className="font-bold text-[#8a6144]">📧 Email:</span>
                    <span className="break-all">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 rounded-lg border border-[#8a6144]/10 dark:border-gray-600">
                    <span className="font-bold text-[#8a6144]">📞 Phone:</span>
                    <span>{employee.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 rounded-lg border border-[#8a6144]/10 dark:border-gray-600">
                    <span className="font-bold text-[#8a6144]">📅 Joined:</span>
                    <span>{employee.joiningDate ? formatDate(employee.joiningDate) : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 rounded-lg border border-[#8a6144]/10 dark:border-gray-600">
                    <span className="font-bold text-[#8a6144]">💰 Salary:</span>
                    <span>₹{employee.salary.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-[#fffbf5] dark:bg-gray-700/50 p-2 rounded-lg border border-[#8a6144]/10 dark:border-gray-600">
                    <span className="font-bold text-[#8a6144]">🌴 Leaves Left:</span>
                    <span>{employee.holidaysLeft}</span>
                </div>

                <div className="mt-4 bg-[#fffbf5] dark:bg-gray-700/50 p-3 rounded-xl border border-[#8a6144]/10 dark:border-gray-600">
                    <h4 className="font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2 mb-2">
                        📄 Documents:
                    </h4>
                    <ul className="list-disc list-inside text-blue-600 dark:text-blue-400 space-y-1">
                        {employee.idProofUrl && (
                            <li><a href={employee.idProofUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium italic break-all">ID Proof</a></li>
                        )}
                        {employee.documents?.map((doc, i) => (
                            <li key={i}><a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium italic break-all">{doc.name}</a></li>
                        ))}
                        {!employee.idProofUrl && (!employee.documents || employee.documents.length === 0) && (
                            <li className="text-gray-400 italic">No documents uploaded</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#8a6144]/10 dark:border-gray-700">
                <Button onClick={() => onEdit(employee)} variant="brand" className="px-6 rounded-full shadow-md border-2 border-[#b8866f]">Edit</Button>
                <Button onClick={() => onDelete(employee)} className="px-6 rounded-full shadow-md bg-[#433020] hover:bg-[#2a1d13] text-white border-none transition-all duration-300">Delete</Button>
            </div>
        </div>
    );
};

const ManageEmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/hr/employees');
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setModalOpen(true);
    };

    const handleDelete = async (employee) => {
        if (window.confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
            try {
                await api.delete(`/hr/employees/${employee._id}`);
                fetchData();
            } catch (error) {
                console.error("Failed to delete employee", error);
                alert("Could not delete employee.");
            }
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-8 transition-colors duration-300">
            <div className="flex flex-wrap justify-between items-center gap-4 max-w-7xl mx-auto w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#433020] dark:text-gray-100 drop-shadow-sm">
                    Manage <span className="text-[#8a6144]">Employees</span>
                </h1>
            </div>

            <div className="max-w-7xl mx-auto w-full">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name, department or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 md:px-6 md:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-[#8a6144]/20 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-[#8a6144] focus:border-[#8a6144] outline-none shadow-lg shadow-[#433020]/5 dark:shadow-black/20 text-xs md:text-base text-[#433020] dark:text-gray-100 transition-all placeholder-[#8a6144]/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
                {filteredEmployees.map(emp => (
                    <EmployeeCard key={emp._id} employee={emp} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <div className="text-center py-20 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-[#8a6144]/30 max-w-2xl mx-auto">
                    <p className="text-[#8a6144] dark:text-gray-400 text-lg font-medium">No employees found matching your search.</p>
                </div>
            )}

            {selectedEmployee && (
                <EditEmployeeModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    employee={selectedEmployee}
                    onUpdate={fetchData}
                />
            )}
        </div>
    );
};

export default ManageEmployeesPage;
