'use client';
import { useEffect, useState } from 'react';
import { adminAPI, aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import {
    Brain, Users, Activity, Target, BarChart3,
    ArrowLeft, Shield, Zap, Database, TrendingUp,
    Heart, Clock, MessageCircle, ChevronRight,
    Layers, Sparkles, PieChart, AlertCircle
} from 'lucide-react';

export default function AdminAIDashboard() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [ragStats, setRagStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') { setLoading(false); return; }
        Promise.all([
            adminAPI.getAIStats().catch(() => null),
            aiAPI.ragStats().catch(() => null),
        ]).then(([statsRes, ragRes]) => {
            if (statsRes?.data) setStats(statsRes.data);
            if (ragRes?.data) setRagStats(ragRes.data);
            setLoading(false);
        });
    }, [isAuthenticated, user]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                        <Shield size={36} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Admin Access Required</h2>
                    <p className="text-gray-400 mb-8">Sign in with an admin account to access this dashboard</p>
                    <Link href="/login" className="btn-primary px-8 py-3 inline-block">Sign In as Admin</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-10 w-72 shimmer rounded-xl mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-36 shimmer rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-72 shimmer rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const goalsMax = Math.max(...(stats?.topHealthGoals || []).map((g: any) => g.value || 0), 1);
    const ageMax = Math.max(...(stats?.ageGroupDistribution || []).map((a: any) => a.value || 0), 1);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2.5 glass rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Brain size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin AI Dashboard</h1>
                        <p className="text-gray-400 text-sm">Monitor AI engine performance, health profiles, and knowledge base</p>
                    </div>
                </div>
                <Link href="/ai/chat" className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
                    <MessageCircle size={16} /> Test RAG Chat
                </Link>
            </div>

            {/* RAG Engine Status Banner */}
            {ragStats && (
                <div className="glass rounded-2xl p-5 mb-6 border border-primary-500/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full" />
                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                                <Database size={22} className="text-primary-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    RAG Knowledge Base
                                    <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Auto-refreshes every 30 minutes with latest product data</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="glass-light rounded-xl px-4 py-2.5 text-center border border-white/5">
                                <div className="text-lg font-bold text-primary-400">{ragStats.totalChunks}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Chunks</div>
                            </div>
                            {ragStats.chunksByType && Object.entries(ragStats.chunksByType).slice(0, 3).map(([type, count]: any) => (
                                <div key={type} className="glass-light rounded-xl px-4 py-2.5 text-center border border-white/5">
                                    <div className="text-lg font-bold text-gray-300">{count}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{type}</div>
                                </div>
                            ))}
                            <div className="glass-light rounded-xl px-4 py-2.5 text-center border border-white/5">
                                <div className="text-xs font-semibold text-purple-300">{ragStats.model}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">LLM Model</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Health Profiles</span>
                        </div>
                        <div className="text-4xl font-bold text-white mb-1">{stats?.totalHealthProfiles || 0}</div>
                        <p className="text-[11px] text-gray-500">Users with completed health profiles</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Heart size={20} className="text-green-400" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Avg Health Score</span>
                        </div>
                        <div className="text-4xl font-bold text-green-400 mb-1">{stats?.avgHealthScore?.toFixed(1) || '0.0'}</div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mt-2">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{ width: `${stats?.avgHealthScore || 0}%` }} />
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full" />
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                <Activity size={20} className="text-primary-400" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">AI Activity</span>
                        </div>
                        <div className="text-4xl font-bold text-primary-400 mb-1">{stats?.recentAiActivity?.length || 0}</div>
                        <p className="text-[11px] text-gray-500">Recent AI sessions &amp; interactions</p>
                    </div>
                </div>
            </div>

            {/* Top Health Goals + Common Symptoms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Target size={20} className="text-amber-400" /> Top User Health Goals
                    </h3>
                    <div className="space-y-4">
                        {stats?.topHealthGoals?.map((g: any, i: number) => {
                            const pct = (g.value / goalsMax) * 100;
                            const colors = [
                                'from-primary-500 to-blue-400',
                                'from-purple-500 to-violet-400',
                                'from-green-500 to-emerald-400',
                                'from-amber-500 to-yellow-400',
                                'from-red-500 to-pink-400',
                                'from-cyan-500 to-blue-400',
                                'from-indigo-500 to-purple-400',
                                'from-teal-500 to-green-400',
                            ];
                            return (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{g.label}</span>
                                        <span className="text-gray-500 text-xs">{g.value} users</span>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-700 group-hover:shadow-lg`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        {(!stats?.topHealthGoals || stats.topHealthGoals.length === 0) && (
                            <div className="text-center py-8">
                                <Target size={32} className="text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No health goal data available yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-400" /> Common Symptoms Detected
                    </h3>
                    {stats?.topSymptoms && stats.topSymptoms.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {stats.topSymptoms.map((s: any, i: number) => {
                                    const sizes = ['text-lg', 'text-base', 'text-sm', 'text-sm', 'text-xs'];
                                    const bgs = [
                                        'bg-red-500/15 border-red-500/20 text-red-300',
                                        'bg-orange-500/15 border-orange-500/20 text-orange-300',
                                        'bg-amber-500/15 border-amber-500/20 text-amber-300',
                                        'bg-yellow-500/15 border-yellow-500/20 text-yellow-300',
                                        'bg-pink-500/15 border-pink-500/20 text-pink-300'
                                    ];
                                    return (
                                        <span key={i} className={`px-3.5 py-2 rounded-xl border font-medium ${bgs[i % bgs.length]} ${sizes[Math.min(i, sizes.length - 1)]} transition-all hover:scale-105`}>
                                            {s.label}
                                            <span className="ml-1.5 opacity-60 text-[10px]">{s.value}</span>
                                        </span>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                                <Clock size={10} /> Based on AI Chat &amp; Symptom Search interactions
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle size={32} className="text-gray-700 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No symptom data available yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Age Distribution + Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-blue-400" /> Age Group Distribution
                    </h3>
                    {stats?.ageGroupDistribution && stats.ageGroupDistribution.length > 0 ? (
                        <div className="space-y-4">
                            {stats.ageGroupDistribution.map((d: any, i: number) => {
                                const pct = (d.value / ageMax) * 100;
                                const ageColors = [
                                    { bg: 'from-emerald-500 to-green-400', dot: 'bg-emerald-400' },
                                    { bg: 'from-blue-500 to-cyan-400', dot: 'bg-blue-400' },
                                    { bg: 'from-purple-500 to-violet-400', dot: 'bg-purple-400' },
                                    { bg: 'from-amber-500 to-yellow-400', dot: 'bg-amber-400' },
                                    { bg: 'from-red-500 to-pink-400', dot: 'bg-red-400' },
                                ];
                                const color = ageColors[i % ageColors.length];
                                return (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-28 text-right flex items-center justify-end gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                                            <span className="text-sm text-gray-400 font-medium group-hover:text-white transition-colors">{d.label}</span>
                                        </div>
                                        <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden flex items-center">
                                            <div className={`h-full bg-gradient-to-r ${color.bg} rounded-lg transition-all duration-700 flex items-center justify-end pr-2`}
                                                style={{ width: `${Math.max(pct, 8)}%` }}>
                                                <span className="text-[10px] text-white font-bold">{d.value}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <PieChart size={32} className="text-gray-700 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No age group data available yet</p>
                        </div>
                    )}
                </div>

                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400" /> Recent AI Activity
                    </h3>
                    {stats?.recentAiActivity && stats.recentAiActivity.length > 0 ? (
                        <div className="space-y-1">
                            {stats.recentAiActivity.map((activity: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] px-3 -mx-3 rounded-lg transition-colors group">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Activity size={12} className="text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">{activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Zap size={32} className="text-gray-700 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No recent AI activity logged</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RAG Chunk Type Breakdown */}
            {ragStats?.chunksByType && Object.keys(ragStats.chunksByType).length > 0 && (
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Database size={20} className="text-cyan-400" /> Knowledge Base Breakdown
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(ragStats.chunksByType).map(([type, count]: any) => {
                            const iconMap: Record<string, any> = {
                                'product': <Layers size={20} className="text-blue-400" />,
                                'category': <BarChart3 size={20} className="text-purple-400" />,
                                'knowledge': <Brain size={20} className="text-green-400" />,
                                'stats': <TrendingUp size={20} className="text-amber-400" />,
                                'trending': <Sparkles size={20} className="text-pink-400" />,
                                'top_rated': <Heart size={20} className="text-red-400" />,
                            };
                            return (
                                <div key={type} className="glass-light rounded-xl p-4 text-center border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="mx-auto w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        {iconMap[type] || <Database size={20} className="text-gray-400" />}
                                    </div>
                                    <div className="text-xl font-bold text-white">{count}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{type.replace('_', ' ')}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
