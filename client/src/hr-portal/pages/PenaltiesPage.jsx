import React, { useState, useEffect } from "react";
import api from "../api/api.js";
import Spinner from "../components/Spinner.jsx";
import { motion, AnimatePresence } from "framer-motion";

const PenaltiesPage = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/hr/penalties?month=${month}`);
        setPenalties(data);
      } catch (err) {
        console.error("Failed to fetch penalties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
        <Spinner />
      </div>
    </div>
  );

  const [yearPart, monthPart] = month.split('-');
  const displayMonth = new Date(yearPart, monthPart - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-10 transition-colors duration-300">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-[#433020] dark:text-gray-100 animate-fade-in-up drop-shadow-sm flex items-center justify-center gap-3">
        <span className="text-[#8a6144]">Penalty</span> Management
      </h1>

      {/* Main Content Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 animate-fade-in max-w-7xl mx-auto overflow-hidden transition-all duration-300">
        <div className="flex flex-wrap justify-between items-center mb-8 gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-[#433020] dark:text-gray-100 flex items-center gap-2">
              📱 Touch Penalties for
            </h2>
            <span className="text-sm font-normal text-[#8a6144] dark:text-gray-400 italic mt-1">
              {displayMonth}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 items-center bg-[#f5e6d3]/30 dark:bg-gray-700/30 p-2 md:p-3 rounded-2xl border border-[#8a6144]/10 dark:border-gray-600">
            <div className="flex items-center gap-2">
              <label className="text-[10px] md:text-sm font-bold text-[#433020] dark:text-gray-200 uppercase tracking-wider">Select Month:</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="p-1.5 md:p-2.5 bg-white dark:bg-gray-700 border border-[#8a6144]/20 dark:border-gray-600 rounded-xl text-xs md:text-sm text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#8a6144]/10 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
              <thead className="bg-[#fffbf5] dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Penalty Count</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#8a6144]/5 dark:divide-gray-700/50">
                {penalties.length > 0 ? (
                  penalties.map((p, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[#fffbf5] dark:hover:bg-gray-700/30 transition duration-200 cursor-pointer"
                      onClick={() => setSelectedEmployee(p)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-[#433020] dark:text-gray-100">{p.name}</p>
                        <p className="text-[11px] font-bold text-[#8a6144] dark:text-gray-400 uppercase tracking-tighter">{p.employeeId}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#433020] dark:text-gray-300 font-medium">
                        {p.department}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-4 py-1 rounded-full text-xs font-black shadow-sm ${p.penaltyCount > 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}>
                          {p.penaltyCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#8a6144] hover:text-[#433020] dark:hover:text-white transition-colors">
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-[#8a6144] dark:text-gray-500 italic bg-white/40 dark:bg-gray-800/40">
                      No penalties found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmployee(null)}
              className="absolute inset-0 bg-[#433020]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20 relative z-10"
            >
              <div className="p-8 border-b border-[#8a6144]/10 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#433020] dark:text-gray-100">
                    Penalty Details
                  </h2>
                  <p className="text-[#8a6144] font-bold text-sm uppercase tracking-tighter mt-1">
                    {selectedEmployee.name} ({selectedEmployee.employeeId})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 hover:bg-[#8a6144]/10 dark:hover:bg-gray-800 rounded-full transition-colors text-[#433020] dark:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 md:p-8 overflow-y-auto max-h-[60vh]">
                {selectedEmployee.dates && selectedEmployee.dates.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-[#8a6144]/10 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-[#8a6144]/10 dark:divide-gray-700">
                      <thead className="bg-[#fffbf5] dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-[#8a6144] dark:text-gray-300 uppercase tracking-wider">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8a6144]/5 dark:divide-gray-700">
                        {selectedEmployee.dates.map((d, i) => (
                          <tr key={i} className="hover:bg-[#fffbf5] dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-[#433020] dark:text-gray-200">
                              {new Date(d.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {d.action === "Check-in" ? "Mobile Check-in" : d.action === "Check-out" ? "Mobile Check-out" : d.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {d.latitude && d.longitude ? (
                                <a
                                  href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold italic"
                                >
                                  View Location 📍
                                </a>
                              ) : (
                                <span className="text-[#8a6144]/40 italic">Unknown</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-[#8a6144] dark:text-gray-500 italic">
                      No detailed penalties for this employee in the selected month.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-[#8a6144]/10 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="px-8 py-2 bg-[#433020] hover:bg-[#2a1d13] text-white text-xs font-bold rounded-full shadow-lg transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PenaltiesPage;
