// import React, { useState, useEffect,useMemo } from 'react';
// import Button from '../components/Button.jsx';
// import api from '../api/api.js';
// import Spinner from '../components/Spinner.jsx';
// import Modal from '../components/Modal.jsx';
// import { formatDate } from '../utils/formatDate.js';

// const EODReportsPage = () => {
//     const [allReports, setAllReports] = useState([]);
//     const [employees, setEmployees] = useState([]);
//     const [notSubmitted, setNotSubmitted] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const [selectedEod, setSelectedEod] = useState(null);
//     const [isEodModalOpen, setEodModalOpen] = useState(false);

//     const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
//     const [searchTerm, setSearchTerm] = useState('');

//     const [isMonthlyReportModalOpen, setMonthlyReportModalOpen] = useState(false);
//     const [monthlyReportData, setMonthlyReportData] = useState([]);

//     // Fetch constant data (all reports, all employees) only once on component mount
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             try {
//                 setLoading(true);
//                 const [allReportsRes, allEmployeesRes] = await Promise.all([
//                     api.get('/hr/eod-reports'), // Gets all reports ever submitted
//                     api.get('/hr/employees')   // Gets all employees
//                 ]);
//                 setAllReports(allReportsRes.data.reports);
//                 setEmployees(allEmployeesRes.data);
//             } catch (error) {
//                 console.error("Failed to fetch initial data", error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchInitialData();
//     }, []); // Empty dependency array ensures this runs only once

//     // Fetch data that depends on the filterDate (i.e., the list of who hasn't submitted)
//     useEffect(() => {
//         const fetchNotSubmitted = async () => {
//             try {
//                 const { data: eodData } = await api.get(`/hr/eod-reports?date=${filterDate}`);
//                 setNotSubmitted(eodData.notSubmittedList);
//             } catch (error) {
//                 console.error("Failed to fetch non-submission data for the selected date", error);
//             }
//         };
//         fetchNotSubmitted();
//     }, [filterDate]); // This runs only when filterDate changes

//     // Filter displayed reports based on search term AND selected date
//     const filteredReports = useMemo(() => {
//         return allReports
//             .filter(report => report.date.startsWith(filterDate))
//             .filter(report => {
//                 // --- CRASH FIX: Add robust checks to prevent crash ---
//                 if (!report.employeeId) return false; // Skip if employee record is missing
//                 if (!searchTerm) return true; // Show all if search is empty

//                 // Safely check name and employeeId before calling toLowerCase()
//                 const nameMatch = report.employeeId.name && report.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase());
//                 const idMatch = report.employeeId.employeeId && report.employeeId.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

//                 return nameMatch || idMatch;
//             });
//     }, [allReports, searchTerm, filterDate]);

//     const handleCardClick = (report) => {
//         setSelectedEod(report);
//         setEodModalOpen(true);
//     };

//     const handleGenerateMonthlyReport = () => {
//         const currentMonth = new Date().getMonth();
//         const currentYear = new Date().getFullYear();

//         const monthReports = allReports.filter(report => {
//             const reportDate = new Date(report.date);
//             return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
//         });

//         const eodCounts = {};
//         monthReports.forEach(report => {
//             if (report.employeeId) { // Ensure employeeId exists
//                 const empId = report.employeeId._id;
//                 if (!eodCounts[empId]) {
//                     eodCounts[empId] = 0;
//                 }
//                 eodCounts[empId] += 1;
//             }
//         });

//         const reportData = employees.map(emp => ({
//             name: emp.name,
//             department: emp.department,
//             count: eodCounts[emp._id] || 0,
//         }));

//         setMonthlyReportData(reportData);
//         setMonthlyReportModalOpen(true);
//     };

//     if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;

//     return (
//         <div className="space-y-8">
//             <div className="flex flex-wrap justify-between items-center gap-4">
//                 <h1 className="text-3xl font-bold text-gray-800">End-of-Day Reports</h1>
//                 <Button onClick={handleGenerateMonthlyReport}>Generate Monthly Report</Button>
//             </div>

//             <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap gap-4 items-center">
//                 <div className="flex-grow">
//                     <label htmlFor="search" className="sr-only">Search</label>
//                     <input 
//                         type="text"
//                         id="search"
//                         placeholder="Search by name or ID in the reports below..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded-md"
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="filterDate" className="mr-2 text-sm font-medium">Date:</label>
//                     <input 
//                         type="date" 
//                         id="filterDate"
//                         value={filterDate}
//                         onChange={(e) => setFilterDate(e.target.value)}
//                         className="p-2 border border-gray-300 rounded-md"
//                     />
//                 </div>
//             </div>

//             <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
//                 <h2 className="text-xl font-semibold text-orange-800 mb-2">Pending EOD Submissions for {formatDate(filterDate)}</h2>
//                 {notSubmitted.length > 0 ? (
//                     <ul className="list-disc list-inside">
//                         {notSubmitted.map(emp => (
//                             <li key={emp._id} className="text-orange-700">
//                                 <span className="font-medium">{emp.name}</span> ({emp.department}) - ID: {emp.employeeId}
//                             </li>
//                         ))}
//                     </ul>
//                 ) : (
//                     <p className="text-gray-600">All present employees have submitted their EOD reports for this date.</p>
//                 )}
//             </div>

//             <div>
//                 <h2 className="text-2xl font-semibold text-gray-700 mb-4">Submitted Reports for {formatDate(filterDate)}</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredReports.map(report => (
//                         <div key={report._id} onClick={() => handleCardClick(report)} className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow">
//                             <p className="font-bold text-lg text-blue-600">{report.employeeId.name}</p>
//                             <p className="text-sm text-gray-500">{report.employeeId.department} - {report.employeeId.employeeId}</p>
//                             <p className="text-sm text-gray-400 mt-1">{formatDate(report.date)}</p>
//                             <p className="mt-2 text-gray-700 italic truncate">"{report.eod}"</p>
//                         </div>
//                     ))}
//                 </div>
//                  {filteredReports.length === 0 && !loading && (
//                     <p className="text-gray-500 mt-4">No EOD reports found for this date or search criteria.</p>
//                 )}
//             </div>

//             {selectedEod && (
//                 <Modal isOpen={isEodModalOpen} onClose={() => setEodModalOpen(false)} title={`EOD from ${selectedEod.employeeId.name}`}>
//                     <div className="space-y-4">
//                         <div>
//                             <p className="font-semibold">Date:</p>
//                             <p>{formatDate(selectedEod.date)}</p>
//                         </div>
//                         <div>
//                             <p className="font-semibold">Report:</p>
//                             <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{selectedEod.eod}</p>
//                         </div>
//                     </div>
//                     <div className="mt-6 flex justify-end">
//                         <Button onClick={() => setEodModalOpen(false)} variant="secondary">Close</Button>
//                     </div>
//                 </Modal>
//             )}

//             <Modal isOpen={isMonthlyReportModalOpen} onClose={() => setMonthlyReportModalOpen(false)} title="Monthly EOD Submission Report">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
//                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
//                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">EODs Submitted this Month</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {monthlyReportData.map(item => (
//                             <tr key={item.name}>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.department}</td>
//                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">{item.count}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                  <div className="mt-6 flex justify-end">
//                     <Button onClick={() => setMonthlyReportModalOpen(false)} variant="secondary">Close</Button>
//                 </div>
//             </Modal>
//         </div>
//     );
// };

// export default EODReportsPage;

import React, { useState, useEffect, useMemo } from 'react';
import Button from '../components/Button.jsx';
import api from '../api/api.js';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import { formatDate } from '../utils/formatDate.js';

const EODReportsPage = () => {
  const [allReports, setAllReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notSubmitted, setNotSubmitted] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEod, setSelectedEod] = useState(null);
  const [isEodModalOpen, setEodModalOpen] = useState(false);

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isMonthlyReportModalOpen, setMonthlyReportModalOpen] = useState(false);
  const [monthlyReportData, setMonthlyReportData] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [allReportsRes, allEmployeesRes] = await Promise.all([
          api.get('/hr/eod-reports'),
          api.get('/hr/employees')
        ]);
        setAllReports(allReportsRes.data.reports);
        setEmployees(allEmployeesRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchNotSubmitted = async () => {
      try {
        const { data: eodData } = await api.get(`/hr/eod-reports?date=${filterDate}`);
        setNotSubmitted(eodData.notSubmittedList);
      } catch (error) {
        console.error("Failed to fetch non-submission data for the selected date", error);
      }
    };
    fetchNotSubmitted();
  }, [filterDate]);

  const filteredReports = useMemo(() => {
    return allReports
      .filter(report => report.date.startsWith(filterDate))
      .filter(report => {
        if (!report.employeeId) return false;
        if (!searchTerm) return true;
        const nameMatch = report.employeeId.name && report.employeeId.name.toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = report.employeeId.employeeId && report.employeeId.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || idMatch;
      });
  }, [allReports, searchTerm, filterDate]);

  const handleCardClick = (report) => {
    setSelectedEod(report);
    setEodModalOpen(true);
  };

  const handleGenerateMonthlyReport = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthReports = allReports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
    });

    const eodCounts = {};
    monthReports.forEach(report => {
      if (report.employeeId) {
        const empId = report.employeeId._id;
        if (!eodCounts[empId]) {
          eodCounts[empId] = 0;
        }
        eodCounts[empId] += 1;
      }
    });

    const reportData = employees.map(emp => ({
      name: emp.name,
      department: emp.department,
      count: eodCounts[emp._id] || 0,
    }));

    setMonthlyReportData(reportData);
    setMonthlyReportModalOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
        <Spinner />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-10 transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-center gap-4 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#433020] dark:text-gray-100 drop-shadow-sm flex items-center gap-3 italic whitespace-nowrap">
          📄 End-of-Day <span className="text-[#8a6144] not-italic">Reports</span>
        </h1>
        <Button onClick={handleGenerateMonthlyReport} variant="brand" className="rounded-full px-8 shadow-lg shadow-[#8a6144]/20">
          Generate Monthly Report
        </Button>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-wrap gap-6 items-center max-w-7xl mx-auto w-full">
        <div className="flex-grow relative group">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3.5 pl-10 bg-[#fffbf5] dark:bg-gray-700/50 border border-[#8a6144]/20 dark:border-gray-600 rounded-2xl text-[#433020] dark:text-gray-100 focus:ring-2 focus:ring-[#8a6144] focus:border-[#8a6144] outline-none shadow-sm transition-all placeholder-[#8a6144]/40"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a6144]">🔍</span>
        </div>
        <div className="flex items-center gap-3 bg-[#fffbf5] dark:bg-gray-700/50 p-2 px-4 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600">
          <label className="text-sm font-bold text-[#8a6144] uppercase tracking-wider">Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-transparent text-[#433020] dark:text-gray-100 focus:outline-none font-medium"
          />
        </div>
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-2xl shadow-sm max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-bold text-orange-800 mb-3">⚠️ Pending EOD Submissions for {formatDate(filterDate)}</h2>
        {notSubmitted.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {notSubmitted.map(emp => (
              <li key={emp._id} className="text-orange-700">
                <span className="font-bold">{emp.name}</span> ({emp.department}) - ID: {emp.employeeId}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 italic">✅ All present employees have submitted their EOD reports for this date.</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100 mb-6 flex items-center gap-2">
          ✅ Submitted <span className="text-[#8a6144]">Reports</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReports.map(report => (
            <div
              key={report._id}
              onClick={() => handleCardClick(report)}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#8a6144]/10 dark:hover:shadow-black/30"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-bold text-[#433020] dark:text-gray-100 group-hover:text-[#8a6144] transition-colors">{report.employeeId.name}</p>
                <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest">EOD Report</span>
              </div>
              <p className="text-sm font-medium text-[#8a6144] dark:text-gray-400 mb-3">{report.employeeId.department} <span className="opacity-30">•</span> {report.employeeId.employeeId}</p>
              <div className="bg-[#fffbf5] dark:bg-gray-700/50 p-4 rounded-2xl border border-[#8a6144]/5 flex flex-col justify-between h-24">
                <p className="text-[#433020] dark:text-gray-200 italic line-clamp-3 text-sm">"{report.eod}"</p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#8a6144]/60 dark:text-gray-500 uppercase tracking-widest">
                <span>📅 {formatDate(report.date)}</span>
                <span className="group-hover:translate-x-1 transition-transform">Details →</span>
              </div>
            </div>
          ))}
        </div>
        {filteredReports.length === 0 && !loading && (
          <p className="text-gray-500 mt-4">No EOD reports found for this date or search criteria.</p>
        )}
      </div>

      {selectedEod && (
        <Modal isOpen={isEodModalOpen} onClose={() => setEodModalOpen(false)} title={`📝 Report: ${selectedEod.employeeId.name}`}>
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between bg-[#fffbf5] dark:bg-gray-700/50 p-3 rounded-2xl border border-[#8a6144]/10">
              <div>
                <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest">Employee Information</p>
                <p className="text-[#433020] dark:text-gray-100 font-bold">{selectedEod.employeeId.name} ({selectedEod.employeeId.employeeId})</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest">Submission Date</p>
                <p className="text-[#433020] dark:text-gray-100 font-bold">{formatDate(selectedEod.date)}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#8a6144] uppercase tracking-widest mb-2 px-1">Detailed Report</p>
              <div className="text-[#433020] dark:text-gray-200 outline-none whitespace-pre-wrap bg-white/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-[#8a6144]/15 shadow-inner min-h-[150px] max-h-[400px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-[#8a6144]/30 scrollbar-track-transparent">
                {selectedEod.eod}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={() => setEodModalOpen(false)} variant="secondary" className="px-8 rounded-full">Close</Button>
          </div>
        </Modal>
      )}

      <Modal isOpen={isMonthlyReportModalOpen} onClose={() => setMonthlyReportModalOpen(false)} title="📆 Monthly EOD Submission Report">
        <div className="overflow-x-auto rounded-2xl border border-[#8a6144]/10 dark:border-gray-700 mt-4">
          <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
            <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">EODs This Month</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
              {monthlyReportData.map(item => (
                <tr key={item.name} className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#433020] dark:text-gray-100">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8a6144] dark:text-gray-400 font-medium">{item.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-center text-[#433020] dark:text-gray-100">
                    <span className="bg-[#8a6144]/10 dark:bg-[#8a6144]/20 px-3 py-1 rounded-full">{item.count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setMonthlyReportModalOpen(false)} variant="secondary" className="px-8 rounded-full">Close</Button>
        </div>
      </Modal>
    </div>
  );
};

export default EODReportsPage;
