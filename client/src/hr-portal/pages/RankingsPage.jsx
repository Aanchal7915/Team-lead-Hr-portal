import React, { useState, useEffect } from 'react';
import api from "../api/api.js";
import useAuth from '../hooks/useAuth.jsx';
import Spinner from '../components/Spinner.jsx';

// Leaderboard component defined within the same file for simplicity
const Leaderboard = ({ title, data, dataKey, rankKey, currentUser, themeColor }) => {
    const rankColors = ["text-yellow-400", "text-gray-400", "text-yellow-600"];
    const rankIcons = ["🥇", "🥈", "🥉"];

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 transition-all hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
            <h2 className={`text-xl md:text-2xl font-bold ${themeColor} mb-6 text-center flex items-center justify-center gap-2`}>
                <span className="w-1.5 h-7 bg-[#8a6144] rounded-full inline-block"></span>
                {title}
            </h2>
            <ul className="space-y-3">
                {data.slice(0, 10).map((player) => (
                    <li key={player._id} className={`flex items-center p-3 md:p-4 rounded-xl transition-all duration-300 ${currentUser && player._id === currentUser._id ? 'bg-[#f5e6d3] dark:bg-[#fff5e6] scale-102 shadow-md border border-[#8a6144]/20' : 'hover:bg-orange-50/50 dark:hover:bg-gray-700/50 bg-white/40 dark:bg-gray-900/40'}`}>
                        <span className={`text-xl md:text-2xl font-bold w-10 md:w-12 text-center ${rankColors[player[rankKey] - 1] || (currentUser && player._id === currentUser._id ? 'text-gray-600' : 'text-gray-600 dark:text-gray-400')}`}>
                            {player[rankKey] <= 3 ? rankIcons[player[rankKey] - 1] : `#${player[rankKey]}`}
                        </span>
                        <div className="flex-grow min-w-0 px-2 md:px-3">
                            <p className={`font-bold text-sm md:text-base truncate ${currentUser && player._id === currentUser._id ? 'text-[#433020]' : 'text-[#433020] dark:text-gray-200'}`}>{player.name}</p>
                            <p className={`text-xs ${currentUser && player._id === currentUser._id ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{player.employeeId}</p>
                        </div>
                        <span className={`text-lg md:text-xl font-black ${themeColor} flex-shrink-0`}>{player[dataKey]}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const RankingsPage = () => {
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
    }, [user, month, year]); // Refetch when filters or user change

    const myRanks = (user && user.role === 'employee' && rankings) ? {
        timely: rankings.timelySignInRankings.find(e => e._id === user._id),
        eod: rankings.eodSubmissionRankings.find(e => e._id === user._id)
    } : null;

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#fff5e6] via-white to-[#f5e6d3] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-white/50">
                <Spinner />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 p-6 bg-gradient-to-br from-[#fff5e6] via-[#f5e6d3] to-[#fff5e6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen transition-colors duration-300">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-[#433020] dark:text-gray-100 drop-shadow-sm tracking-tight mb-2">🏆 Performance Rankings 🏆</h1>
                <p className="text-lg text-[#8a6144] dark:text-gray-300">See how everyone is performing!</p>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-3xl shadow-lg shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 flex flex-wrap gap-4 items-center justify-center">
                <label className="text-sm font-bold text-[#433020] dark:text-gray-200">View Rankings For:</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border border-[#8a6144]/30 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700 text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] dark:focus:ring-gray-500 focus:border-[#8a6144] outline-none">
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                </select>
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="p-2 border border-[#8a6144]/30 dark:border-gray-600 rounded-lg w-28 bg-white/50 dark:bg-gray-700 text-[#433020] dark:text-gray-200 focus:ring-2 focus:ring-[#8a6144] dark:focus:ring-gray-500 focus:border-[#8a6144] outline-none" />
            </div>

            {/* Conditional rendering for when data is available */}
            {rankings ? (
                <>
                    {/* Only show "Your Ranks" to employees */}
                    {user.role === 'employee' && myRanks && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 text-center transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
                                <p className="text-lg font-bold text-[#433020] dark:text-gray-200">Your Timely Sign-in Rank</p>
                                <p className="text-5xl font-extrabold text-[#433020] dark:text-gray-100 my-4">#{myRanks.timely?.timelySignInPercentageRank || 'N/A'}</p>
                                <p className="text-[#8a6144] dark:text-gray-400">with a <span className="font-bold">{myRanks.timely?.timelySignInPercentage || 0}%</span> success rate</p>
                            </div>
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-[#433020]/5 dark:shadow-black/20 border border-white/50 dark:border-gray-700 text-center transform transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#433020]/10 dark:hover:shadow-black/30">
                                <p className="text-lg font-bold text-[#433020] dark:text-gray-200">Your EOD Submission Rank</p>
                                <p className="text-5xl font-extrabold text-[#433020] dark:text-gray-100 my-4">#{myRanks.eod?.eodSubmissionPercentageRank || 'N/A'}</p>
                                <p className="text-[#8a6144] dark:text-gray-400">with a <span className="font-bold">{myRanks.eod?.eodSubmissionPercentage || 0}%</span> compliance rate</p>
                            </div>
                        </div>
                    )}

                    {/* Leaderboards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Leaderboard
                            title={`Top 10 - Timely Sign-ins (${new Date(year, month - 1).toLocaleString('default', { month: 'long' })})`}
                            data={rankings.timelySignInRankings}
                            dataKey="timelySignInPercentage"
                            rankKey="timelySignInPercentageRank"
                            currentUser={user}
                            themeColor="text-green-600"
                        />
                        <Leaderboard
                            title={`Top 10 - EOD Submissions (${new Date(year, month - 1).toLocaleString('default', { month: 'long' })})`}
                            data={rankings.eodSubmissionRankings}
                            dataKey="eodSubmissionPercentage"
                            rankKey="eodSubmissionPercentageRank"
                            currentUser={user}
                            themeColor="text-blue-600"
                        />
                    </div>
                </>
            ) : (
                <p className="text-center text-gray-500">Could not load rankings data for the selected period.</p>
            )}
        </div>
    );
};

export default RankingsPage;
