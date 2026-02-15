'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AdminAIDashboard() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') { setLoading(false); return; }
        adminAPI.getAIStats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, [isAuthenticated, user]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔐</span>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    if (loading) return <LoadingSpinner text="Loading AI insights..." size="lg" />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin" className="text-gray-400 hover:text-white">← Back</Link>
                <h1 className="text-3xl font-bold text-white">🧠 Admin AI Dashboard</h1>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Total Health Profiles</h3>
                    <p className="text-3xl font-bold text-white">{stats?.totalHealthProfiles || 0}</p>
                </div>
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Avg. Health Score</h3>
                    <p className="text-3xl font-bold text-health-400">{stats?.avgHealthScore?.toFixed(1) || 0}</p>
                </div>
                <div className="glass p-6 rounded-xl">
                    <h3 className="text-gray-400 text-sm mb-1">Active AI Sessions</h3>
                    <p className="text-3xl font-bold text-primary-400">{stats?.recentAiActivity?.length || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Health Goals */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">🎯 Top User Health Goals</h3>
                    <div className="space-y-4">
                        {stats?.topHealthGoals?.map((g: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{g.label}</span>
                                    <span className="text-gray-500">{g.value} users</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
                                        style={{ width: `${(g.value / (stats.totalHealthProfiles || 1)) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Symptoms */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">🩺 Common Symptoms Detected</h3>
                    <div className="flex flex-wrap gap-2">
                        {stats?.topSymptoms?.map((s: any, i: number) => (
                            <span key={i} className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                                {s.label} <span className="text-white/50 ml-1 text-xs">{s.value}</span>
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Based on AI Chat & Symptom Search logs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Age Demographics */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">👥 Age Group Distribution</h3>
                    <div className="space-y-3">
                        {stats?.ageGroupDistribution?.map((d: any, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-32 text-sm text-gray-400 text-right">{d.label}</span>
                                <div className="flex-1 h-8 bg-white/5 rounded px-2 flex items-center">
                                    <div className="h-4 bg-blue-500/40 rounded-sm" style={{ width: `${d.value * 2}%` }}></div>
                                    <span className="ml-2 text-xs text-white">{d.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">⚡ Recent AI Activity</h3>
                    <div className="space-y-0">
                        {stats?.recentAiActivity?.map((activity: string, i: number) => (
                            <div key={i} className="py-3 border-b border-white/5 text-sm text-gray-400 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                                {activity}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
