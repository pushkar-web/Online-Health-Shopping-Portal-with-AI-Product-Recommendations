'use client';
import { useEffect, useState } from 'react';
import { adminAPI, aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import {
    Users, Package, ShoppingCart, DollarSign, BarChart3,
    Zap, Settings, Brain, TrendingUp, ArrowUpRight,
    ChevronRight, Shield, ClipboardList, Tag, Eye,
    Activity, Layers
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [ragStats, setRagStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') { setLoading(false); return; }
        Promise.all([
            adminAPI.getStats().catch(() => null),
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-64 shimmer rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Settings size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400 text-sm">Welcome back, {user?.firstName}. Here&apos;s your store overview.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/orders" className="glass rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white flex items-center gap-2 border border-white/5 hover:border-white/10 transition-all">
                        <ClipboardList size={16} /> Orders
                    </Link>
                    <Link href="/admin/products" className="glass rounded-xl px-4 py-2.5 text-sm text-gray-300 hover:text-white flex items-center gap-2 border border-white/5 hover:border-white/10 transition-all">
                        <Package size={16} /> Products
                    </Link>
                    <Link href="/admin/ai" className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
                        <Brain size={16} /> AI Dashboard
                    </Link>
                </div>
            </div>

            {/* RAG Agent Status */}
            {ragStats && (
                <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between border border-primary-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-gray-300">RAG AI Engine Active</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                            {ragStats.totalChunks} knowledge chunks indexed
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {ragStats.model}
                        </span>
                    </div>
                    <Link href="/admin/ai" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                        View AI Stats <ChevronRight size={12} />
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="glass-light rounded-2xl p-6 border border-blue-500/10 hover-card relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Users size={20} className="text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">+12%</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">{(stats?.totalUsers || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Users</div>
                    </div>
                </div>

                <div className="glass-light rounded-2xl p-6 border border-purple-500/10 hover-card relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Package size={20} className="text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">+5</span>
                        </div>
                        <div className="text-3xl font-bold text-purple-400 mb-1">{(stats?.totalProducts || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Products</div>
                    </div>
                </div>

                <div className="glass-light rounded-2xl p-6 border border-green-500/10 hover-card relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <ShoppingCart size={20} className="text-green-400" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">+23%</span>
                        </div>
                        <div className="text-3xl font-bold text-green-400 mb-1">{(stats?.totalOrders || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Orders</div>
                    </div>
                </div>

                <div className="glass-light rounded-2xl p-6 border border-amber-500/10 hover-card relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <DollarSign size={20} className="text-amber-400" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">+18%</span>
                        </div>
                        <div className="text-3xl font-bold text-amber-400 mb-1">${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Revenue</div>
                    </div>
                </div>
            </div>

            {/* Category Distribution + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category Distribution */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary-400" /> Category Distribution
                    </h3>
                    <div className="space-y-3">
                        {(stats?.categoryDistribution || []).map((cat: any, i: number) => {
                            const maxCount = Math.max(...(stats?.categoryDistribution || []).map((c: any) => c.count || 0), 1);
                            const pct = ((cat.count || 0) / maxCount) * 100;
                            const colors = [
                                'from-blue-500 to-cyan-400',
                                'from-purple-500 to-violet-400',
                                'from-green-500 to-emerald-400',
                                'from-amber-500 to-yellow-400',
                                'from-red-500 to-pink-400',
                                'from-indigo-500 to-blue-400',
                                'from-teal-500 to-green-400',
                                'from-orange-500 to-amber-400',
                                'from-rose-500 to-red-400',
                                'from-cyan-500 to-sky-400',
                            ];
                            return (
                                <div key={cat.name} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{cat.name}</span>
                                        <span className="text-gray-500">{cat.count} products</span>
                                    </div>
                                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-1000 group-hover:shadow-lg`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Zap size={20} className="text-amber-400" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/admin/orders', icon: <ClipboardList size={24} />, label: 'Manage Orders', desc: 'Update status & view details', color: 'from-blue-500/15 to-blue-600/5', textColor: 'text-blue-400', border: 'hover:border-blue-500/20' },
                            { href: '/admin/products', icon: <Package size={24} />, label: 'Manage Products', desc: 'Add, edit, remove products', color: 'from-purple-500/15 to-purple-600/5', textColor: 'text-purple-400', border: 'hover:border-purple-500/20' },
                            { href: '/admin/users', icon: <Users size={24} />, label: 'Manage Users', desc: 'View all registered users', color: 'from-green-500/15 to-green-600/5', textColor: 'text-green-400', border: 'hover:border-green-500/20' },
                            { href: '/admin/coupons', icon: <Tag size={24} />, label: 'Manage Coupons', desc: 'Create & manage coupons', color: 'from-amber-500/15 to-amber-600/5', textColor: 'text-amber-400', border: 'hover:border-amber-500/20' },
                            { href: '/admin/ai', icon: <Brain size={24} />, label: 'AI Dashboard', desc: 'Health profiles & AI stats', color: 'from-primary-500/15 to-primary-600/5', textColor: 'text-primary-400', border: 'hover:border-primary-500/20' },
                            { href: '/ai/chat', icon: <Activity size={24} />, label: 'RAG AI Chat', desc: 'Test Groq-powered chat', color: 'from-cyan-500/15 to-cyan-600/5', textColor: 'text-cyan-400', border: 'hover:border-cyan-500/20' },
                        ].map(action => (
                            <Link key={action.href} href={action.href}
                                className={`glass-light rounded-xl p-5 hover-card group block border border-transparent ${action.border} transition-all relative overflow-hidden`}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className="relative">
                                    <div className={`${action.textColor} mb-3 group-hover:scale-110 transition-transform`}>{action.icon}</div>
                                    <div className="text-sm font-semibold text-white mb-0.5">{action.label}</div>
                                    <div className="text-[11px] text-gray-500">{action.desc}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            {stats?.recentProducts?.length > 0 && (
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Layers size={20} className="text-purple-400" /> Recently Added Products
                        </h3>
                        <Link href="/admin/products" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                            View All <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="text-left pb-4 font-medium">Product</th>
                                    <th className="text-left pb-4 font-medium">Category</th>
                                    <th className="text-right pb-4 font-medium">Price</th>
                                    <th className="text-right pb-4 font-medium">Rating</th>
                                    <th className="text-right pb-4 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.recentProducts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm overflow-hidden border border-white/5">
                                                    {p.imageUrl && p.imageUrl.startsWith('http') ? (
                                                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={16} className="text-gray-500" />
                                                    )}
                                                </div>
                                                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">{p.categoryName}</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="text-gray-200 font-semibold">${p.price?.toFixed(2)}</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, si) => (
                                                        <div key={si} className={`w-1.5 h-1.5 rounded-full mx-[1px] ${si < Math.round(p.averageRating || 0) ? 'bg-amber-400' : 'bg-gray-700'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-gray-400 text-xs">{p.averageRating?.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${(p.stock || 0) > 50
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : (p.stock || 0) > 10
                                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                }`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
