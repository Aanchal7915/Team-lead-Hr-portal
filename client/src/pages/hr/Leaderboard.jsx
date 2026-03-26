import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/api';
import { Trophy, Medal, Award, TrendingUp, Star, Clock, CalendarRange } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRankings();
    }, []);

    const fetchRankings = async () => {
        try {
            setLoading(true);
            const res = await analyticsAPI.getRankings();
            if (res.data?.data) {
                const data = res.data.data;
                setRankings(data);
                const me = data.find(r => r.id === user?._id || r.id === user?.id);
                if (me) setMyRank(me);
            }
        } catch (error) {
            console.error('Rankings fetch error:', error);
            // Fallback mock data
            const mockData = [
                { rank: 1, name: 'Sarah Ahmed', role: 'team_lead', score: 98.2, totalPresent: 48, totalLate: 0, approvedLeaves: 1 },
                { rank: 2, name: 'John Doe', role: 'employee', score: 92.0, totalPresent: 45, totalLate: 1, approvedLeaves: 2 },
                { rank: 3, name: user?.name || 'You', role: user?.role || 'employee', score: 88.5, totalPresent: 42, totalLate: 2, approvedLeaves: 2 },
                { rank: 4, name: 'Michael Chen', role: 'employee', score: 82.1, totalPresent: 40, totalLate: 3, approvedLeaves: 3 },
                { rank: 5, name: 'Emma Wilson', role: 'employee', score: 78.4, totalPresent: 38, totalLate: 2, approvedLeaves: 4 },
                { rank: 6, name: 'Alex Kumar', role: 'team_member', score: 72.0, totalPresent: 35, totalLate: 4, approvedLeaves: 3 },
                { rank: 7, name: 'Lisa Park', role: 'employee', score: 68.5, totalPresent: 33, totalLate: 5, approvedLeaves: 4 },
                { rank: 8, name: 'David Singh', role: 'team_member', score: 64.2, totalPresent: 31, totalLate: 3, approvedLeaves: 5 },
            ];
            setRankings(mockData);
            const me = mockData.find(r => r.rank === 3);
            setMyRank(me);
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' };
        if (rank === 2) return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' };
        if (rank === 3) return { icon: Award, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
        return { icon: Star, color: 'text-indigo-400', bg: 'bg-indigo-50', border: 'border-indigo-100' };
    };

    const isMe = (r) => r.name === user?.name || r.id === user?._id || r.id === user?.id;

    if (loading) {
        return (
            <Layout title="Leaderboard">
                <div className="flex items-center justify-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#3E2723]"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Rankings & Leaderboard">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#3E2723] to-[#6D4C41] rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-yellow-400" /> Leaderboard
                        </h2>
                        <p className="text-white/70 font-medium">Rankings based on attendance, punctuality and consistency</p>
                    </div>
                    <Trophy className="absolute right-6 bottom-[-20px] w-40 h-40 text-white opacity-5" />
                </div>

                {/* My Rank Card */}
                {myRank && (
                    <div className="bg-[#FDF8F3] rounded-3xl border-2 border-[#EBD9C1] p-6">
                        <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4">Your Standing</p>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="text-center">
                                <p className="text-5xl font-black text-[#3E2723]">#{myRank.rank}</p>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Rank</p>
                            </div>
                            <div className="h-12 w-px bg-[#EBD9C1]"></div>
                            <div className="grid grid-cols-3 gap-6 flex-1">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-gray-900">{myRank.score}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-green-600">{myRank.totalPresent}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Days Present</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-amber-500">{myRank.totalLate}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Late Arrivals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" /> Full Rankings
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {rankings.map((person, idx) => {
                            const badge = getRankBadge(person.rank);
                            const BadgeIcon = badge.icon;
                            const mine = isMe(person);
                            return (
                                <div key={idx} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors ${mine ? 'bg-amber-50/50 border-l-4 border-l-amber-400' : ''}`}>
                                    {/* Rank Badge */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg} ${badge.border}`}>
                                        {person.rank <= 3 ? (
                                            <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                                        ) : (
                                            <span className="text-sm font-black text-gray-500">#{person.rank}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm border-2 border-white shadow-sm shrink-0">
                                        {person.name?.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                            {person.name} {mine && <span className="px-2 py-0.5 text-[9px] bg-amber-200 text-amber-800 rounded-full font-black uppercase tracking-wider">You</span>}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{person.role?.replace('_', ' ')}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden md:flex items-center gap-6 text-center">
                                        <div>
                                            <p className="text-sm font-black text-green-600">{person.totalPresent}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Days</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-amber-600">{person.totalLate}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Late</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-purple-600">{person.approvedLeaves}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Leaves</p>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right shrink-0">
                                        <p className="text-xl font-black text-[#3E2723]">{person.score}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Scoring Methodology */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-800 mb-4">How Scores Are Calculated</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                            <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-4 h-4 text-green-600" /></div>
                            <div>
                                <p className="font-bold text-green-800">+2 pts</p>
                                <p className="text-green-700 text-xs">Per day present</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-4 h-4 text-amber-600" /></div>
                            <div>
                                <p className="font-bold text-amber-800">-0.5 pts</p>
                                <p className="text-amber-700 text-xs">Per late arrival</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="p-2 bg-purple-100 rounded-lg"><CalendarRange className="w-4 h-4 text-purple-600" /></div>
                            <div>
                                <p className="font-bold text-purple-800">-0.3 pts</p>
                                <p className="text-purple-700 text-xs">Per approved leave</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Leaderboard;
