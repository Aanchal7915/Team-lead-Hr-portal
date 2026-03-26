import React, { useState, useEffect } from 'react';
import api from "../../hr-portal/api/api.js";
import useAuth from '../../hr-portal/hooks/useAuth.jsx';
import Spinner from '../../hr-portal/components/Spinner.jsx';
import Layout from '../../components/Layout';

// Leaderboard component defined within the same file for simplicity
const Leaderboard = ({ title, data, dataKey, rankKey, currentUser, themeColor }) => {
    const rankColors = ["text-yellow-400", "text-gray-400", "text-yellow-600"];
    const rankIcons = ["🥇", "🥈", "🥉"];

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-xl border border-white/50 transition-all hover:shadow-2xl">
            <h2 className={`text-xl md:text-2xl font-bold ${themeColor} mb-6 text-center flex items-center justify-center gap-2`}>
                <span className="w-1.5 h-7 bg-[#8a6144] rounded-full inline-block"></span>
                {title}
            </h2>
            <ul className="space-y-3">
                {data.slice(0, 10).map((player) => (
                    <li key={player._id} className={`flex items-center p-3 md:p-4 rounded-xl transition-all duration-300 ${currentUser && player._id === currentUser._id ? 'bg-[#f5e6d3] scale-102 shadow-md border border-[#8a6144]/20' : 'hover:bg-orange-50/50 bg-white/40 dark:bg-gray-900/40'}`}>
                        <span className={`text-xl md:text-2xl font-bold w-10 md:w-12 text-center ${rankColors[player[rankKey] - 1] || (currentUser && player._id === currentUser._id ? 'text-[#433020]' : 'text-gray-600 dark:text-gray-400')}`}>
                            {player[rankKey] <= 3 ? rankIcons[player[rankKey] - 1] : `#${player[rankKey]}`}
                        </span>
                        <div className="flex-grow min-w-0 px-2 md:px-3">
                            <p className={`font-bold text-sm md:text-base truncate ${currentUser && player._id === currentUser._id ? 'text-[#433020]' : 'text-[#433020] dark:text-gray-200'}`}>{player.name}</p>
                            <p className={`text-xs ${currentUser && player._id === currentUser._id ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{player.employeeId}</p>
                        </div>
                        <span className={`text-lg md:text-xl font-black ${themeColor} flex-shrink-0`}>{player[dataKey]}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const MyRankings = () => {
    const { user } = useAuth();
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for filters
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchRankings = async () => {
            if (!user) return;

            const endpoint = user.role === 'hr'
                ? `/hr/rankings?month=${month}&year=${year}`
                : `/employee/rankings?month=${month}&year=${year}`;

            try {
                setLoading(true);
                const { data } = await api.get(endpoint);
                setRankings(data);
            } catch (error) {
                console.error("Failed to fetch rankings", error);
                setRankings(null); // Clear old data on error
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [user, month, year]);

    const myRanks = (user && user.role === 'employee' && rankings) ? {
        timely: rankings.timelySignInRankings.find(e => e._id === user._id),
        eod: rankings.eodSubmissionRankings.find(e => e._id === user._id)
    } : null;

    if (loading) return (
        <Layout title="Performance Rankings">
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        </Layout>
    );

    return (
        <Layout title="Performance Rankings">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Filters */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-lg border border-white/50 flex flex-wrap gap-4 items-center justify-center">
                    <label className="text-sm font-bold text-[#433020] dark:text-gray-200">View Rankings For:</label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border border-[#8a6144]/30 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700 text-[#433020] dark:text-gray-200 outline-none">
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                    </select>
                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 border border-[#8a6144]/30 dark:border-gray-600 rounded-lg w-28 bg-white/50 dark:bg-gray-700 text-[#433020] dark:text-gray-200 outline-none" />
                </div>

                {rankings ? (
                    <>
                        {/* Current User's Ranks */}
                        {user.role === 'employee' && myRanks && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#3E2723] p-4 sm:p-8 rounded-3xl shadow-xl text-center text-white transform transition-all hover:scale-[1.02]">
                                    <p className="text-lg font-bold text-amber-200/80 uppercase tracking-widest text-xs mb-2">Your Timely Sign-in Rank</p>
                                    <p className="text-5xl font-black mb-4">#{myRanks.timely?.timelySignInPercentageRank || 'N/A'}</p>
                                    <p className="text-amber-100/60 text-sm italic">with a {myRanks.timely?.timelySignInPercentage || 0}% success rate</p>
                                </div>
                                <div className="bg-[#5D4037] p-4 sm:p-8 rounded-3xl shadow-xl text-center text-white transform transition-all hover:scale-[1.02]">
                                    <p className="text-lg font-bold text-amber-200/80 uppercase tracking-widest text-xs mb-2">Your EOD Submission Rank</p>
                                    <p className="text-5xl font-black mb-4">#{myRanks.eod?.eodSubmissionPercentageRank || 'N/A'}</p>
                                    <p className="text-amber-100/60 text-sm italic">with a {myRanks.eod?.eodSubmissionPercentage || 0}% compliance rate</p>
                                </div>
                            </div>
                        )}

                        {/* Leaderboards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Leaderboard
                                title={`Top 10 - Timely Sign-ins`}
                                data={rankings.timelySignInRankings}
                                dataKey="timelySignInPercentage"
                                rankKey="timelySignInPercentageRank"
                                currentUser={user}
                                themeColor="text-green-600"
                            />
                            <Leaderboard
                                title={`Top 10 - EOD Submissions`}
                                data={rankings.eodSubmissionRankings}
                                dataKey="eodSubmissionPercentage"
                                rankKey="eodSubmissionPercentageRank"
                                currentUser={user}
                                themeColor="text-blue-600"
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-white/80 p-12 rounded-3xl shadow-xl text-center text-gray-500 italic">
                        Could not load rankings data for the selected period.
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyRankings;
