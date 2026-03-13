'use client';
import { useState, useEffect } from 'react';
import { challengeAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Trophy, Flame, Target, Users, CheckCircle, Lock, ChevronRight, Zap, Star, Crown, Medal, Dumbbell, Moon, Sparkles, Heart, Brain, Sun } from 'lucide-react';

const CHALLENGE_ICONS: Record<string, any> = {
    '🛡️': <Target size={28} className="text-white" />,
    '😴': <Moon size={28} className="text-white" />,
    '⚡': <Zap size={28} className="text-white" />,
    '🦴': <Dumbbell size={28} className="text-white" />,
    '🧘': <Brain size={28} className="text-white" />,
    '✨': <Sparkles size={28} className="text-white" />,
};

const GRADIENTS: Record<string, string> = {
    'from-blue-500 to-cyan-500': 'from-blue-500 to-cyan-500',
    'from-indigo-500 to-purple-500': 'from-indigo-500 to-purple-500',
    'from-amber-500 to-orange-500': 'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500': 'from-emerald-500 to-green-500',
    'from-rose-500 to-pink-500': 'from-rose-500 to-pink-500',
    'from-violet-500 to-fuchsia-500': 'from-violet-500 to-fuchsia-500',
};

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [activeChallenge, setActiveChallenge] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [view, setView] = useState<'discover' | 'active'>('discover');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        challengeAPI.getAll().then(r => {
            if (r?.data) setChallenges(r.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const joinChallenge = async (id: number) => {
        setJoining(true);
        try {
            const res = await challengeAPI.join(id);
            if (res?.data) {
                setProgress(res.data);
                setActiveChallenge(challenges.find(c => c.id === id));
                setView('active');
                loadLeaderboard(id);
            }
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Failed to join. Please log in first.');
        }
        setJoining(false);
    };

    const viewProgress = async (challenge: any) => {
        setActiveChallenge(challenge);
        setView('active');
        try {
            const [progRes, lbRes] = await Promise.all([
                challengeAPI.getProgress(challenge.id),
                challengeAPI.getLeaderboard(challenge.id)
            ]);
            if (progRes?.data) setProgress(progRes.data);
            if (lbRes?.data) setLeaderboard(lbRes.data);
        } catch {
            // User hasn't joined yet
            setProgress(null);
            loadLeaderboard(challenge.id);
        }
    };

    const loadLeaderboard = async (id: number) => {
        try {
            const res = await challengeAPI.getLeaderboard(id);
            if (res?.data) setLeaderboard(res.data);
        } catch {}
    };

    const completeTask = async () => {
        if (!activeChallenge) return;
        setCompleting(true);
        try {
            const res = await challengeAPI.completeTask(activeChallenge.id);
            if (res?.data) {
                setProgress(res.data);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                loadLeaderboard(activeChallenge.id);
            }
        } catch (e: any) {
            alert(e?.response?.data?.message || 'Failed to complete task.');
        }
        setCompleting(false);
    };

    const getDifficultyStyle = (d: string) => {
        if (d === 'Hard') return 'bg-red-500/20 text-red-400 border-red-500/20';
        if (d === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/20';
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-white/5 rounded-xl w-64" />
                <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-56 bg-white/5 rounded-2xl" />)}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Confetti overlay */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="absolute animate-bounce" style={{
                            left: `${Math.random() * 100}%`,
                            top: `-${Math.random() * 20}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random() * 2}s`,
                        }}>
                            <div className={`w-2 h-2 rounded-full ${['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]}`}
                                style={{ animation: `fall ${2 + Math.random() * 3}s linear forwards`, transform: `rotate(${Math.random() * 360}deg)` }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                {view === 'active' ? (
                    <button onClick={() => setView('discover')} className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </button>
                ) : (
                    <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                )}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Trophy size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Health Challenges
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/20 font-semibold">GAMIFIED</span>
                        </h1>
                        <p className="text-xs text-gray-500">{view === 'discover' ? 'Join challenges & build healthy habits' : activeChallenge?.title}</p>
                    </div>
                </div>
            </div>

            {/* Discover View */}
            {view === 'discover' && (
                <div className="space-y-6">
                    {/* Stats banner */}
                    <div className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-amber-400">{challenges.length}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Challenges</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-400">{challenges.reduce((s, c) => s + (c.participantCount || 0), 0)}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Participants</div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">{challenges.reduce((s, c) => s + (c.rewardPoints || 0), 0)}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Points</div>
                            </div>
                        </div>
                        <Flame size={32} className="text-amber-500/30" />
                    </div>

                    {/* Challenge Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {challenges.map((c: any) => {
                            const gradient = c.gradient || 'from-blue-500 to-cyan-500';
                            const icon = CHALLENGE_ICONS[c.icon] || <Target size={28} className="text-white" />;
                            return (
                                <div key={c.id} className="glass rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all">
                                    {/* Gradient header */}
                                    <div className={`bg-gradient-to-r ${gradient} p-5 relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                                                {icon}
                                            </div>
                                            <h3 className="text-white font-semibold text-base">{c.title}</h3>
                                        </div>
                                    </div>
                                    {/* Body */}
                                    <div className="p-4">
                                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{c.description}</p>
                                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getDifficultyStyle(c.difficulty)}`}>{c.difficulty}</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">{c.durationDays} days</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Star size={8} className="inline mr-1" />{c.rewardPoints} pts
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Users size={10} /> {c.participantCount || 0} joined
                                            </span>
                                            <button onClick={() => viewProgress(c)}
                                                className={`text-xs px-4 py-2 rounded-xl font-medium bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-opacity flex items-center gap-1`}>
                                                View <ChevronRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Challenge View */}
            {view === 'active' && activeChallenge && (
                <div className="space-y-4">
                    {/* Challenge header card */}
                    <div className={`rounded-2xl p-6 bg-gradient-to-r ${activeChallenge.gradient || 'from-blue-500 to-cyan-500'} relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10" />
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold text-white mb-1">{activeChallenge.title}</h2>
                            <p className="text-sm text-white/80 mb-3">{activeChallenge.description}</p>
                            <div className="flex items-center gap-3 text-white/70 text-xs">
                                <span className="flex items-center gap-1"><Target size={12} /> {activeChallenge.healthGoal}</span>
                                <span className="flex items-center gap-1"><Users size={12} /> {activeChallenge.participantCount || 0} participants</span>
                                <span className="flex items-center gap-1"><Star size={12} /> {activeChallenge.rewardPoints} pts</span>
                            </div>
                        </div>
                    </div>

                    {progress ? (
                        <>
                            {/* Progress stats */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="glass rounded-xl p-4 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-white">{progress.currentDay || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Day</div>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                                        <Flame size={18} /> {progress.streak || 0}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Streak</div>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-emerald-400">{progress.completedTasks || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Tasks Done</div>
                                </div>
                                <div className="glass rounded-xl p-4 border border-white/5 text-center">
                                    <div className="text-2xl font-bold text-purple-400">{progress.totalPoints || 0}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Points</div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="glass rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400">Progress</span>
                                    <span className="text-xs text-gray-500">{progress.currentDay || 0} / {activeChallenge.durationDays} days</span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${activeChallenge.gradient || 'from-blue-500 to-cyan-500'} transition-all duration-500`}
                                        style={{ width: `${Math.min(100, ((progress.currentDay || 0) / activeChallenge.durationDays) * 100)}%` }} />
                                </div>
                                {progress.challengeCompleted && (
                                    <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
                                        <CheckCircle size={16} /> Challenge Completed! Congratulations!
                                    </div>
                                )}
                            </div>

                            {/* Daily Task */}
                            {progress.currentDailyTask && !progress.challengeCompleted && (
                                <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
                                    <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                                        <Sun size={14} /> Today&apos;s Task — Day {progress.currentDay || 1}
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-4">{progress.currentDailyTask}</p>
                                    <button onClick={completeTask} disabled={completing}
                                        className={`w-full px-5 py-3 rounded-xl bg-gradient-to-r ${activeChallenge.gradient || 'from-blue-500 to-cyan-500'} text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50`}>
                                        {completing ? (
                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Completing...</>
                                        ) : (
                                            <><CheckCircle size={16} /> Mark Task Complete</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Daily tasks list */}
                            {progress.dailyTasks?.length > 0 && (
                                <div className="glass rounded-xl p-4 border border-white/5">
                                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                        <Target size={14} className="text-indigo-400" /> All Daily Tasks
                                    </h3>
                                    <div className="space-y-2">
                                        {progress.dailyTasks.map((task: string, i: number) => {
                                            const done = i < (progress.completedTasks || 0);
                                            const current = i === (progress.completedTasks || 0);
                                            return (
                                                <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${done ? 'bg-emerald-500/10' : current ? 'bg-white/10' : 'bg-white/5 opacity-60'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${done ? 'bg-emerald-500 text-white' : current ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-500'}`}>
                                                        {done ? <CheckCircle size={12} /> : i + 1}
                                                    </div>
                                                    <span className={`text-xs ${done ? 'text-emerald-400 line-through' : current ? 'text-white' : 'text-gray-500'}`}>{task}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Not joined yet */
                        <div className="glass rounded-2xl p-6 border border-white/5 text-center">
                            <Lock size={32} className="text-gray-600 mx-auto mb-3" />
                            <h3 className="text-white font-medium mb-1">Join this challenge to get started</h3>
                            <p className="text-xs text-gray-500 mb-4">Get AI-personalized daily health tasks and earn points</p>
                            <button onClick={() => joinChallenge(activeChallenge.id)} disabled={joining}
                                className={`px-8 py-3 rounded-xl bg-gradient-to-r ${activeChallenge.gradient || 'from-blue-500 to-cyan-500'} text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50`}>
                                {joining ? 'Joining...' : 'Join Challenge'}
                            </button>
                        </div>
                    )}

                    {/* Leaderboard */}
                    {leaderboard.length > 0 && (
                        <div className="glass rounded-xl p-4 border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Crown size={14} className="text-amber-400" /> Leaderboard
                            </h3>
                            <div className="space-y-2">
                                {leaderboard.slice(0, 10).map((entry: any, i: number) => (
                                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 0 ? 'bg-amber-500/10' : i === 1 ? 'bg-gray-400/10' : i === 2 ? 'bg-amber-700/10' : 'bg-white/5'}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-white/10'} text-white text-xs font-bold`}>
                                            {i === 0 ? <Crown size={12} /> : i === 1 ? <Medal size={12} /> : i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-xs text-white">User #{entry.userId}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px]">
                                            <span className="text-amber-400 flex items-center gap-0.5"><Flame size={9} />{entry.streak}</span>
                                            <span className="text-emerald-400">{entry.completedTasks} tasks</span>
                                            <span className="text-purple-400 font-bold">{entry.points} pts</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
