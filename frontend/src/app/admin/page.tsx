'use client';
import { useEffect, useState } from 'react';
import { adminAPI, aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
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
                    <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-vcError/8 flex items-center justify-center">
                        <Shield size={28} className="text-vcError" />
                    </div>
                    <h2 className="text-2xl font-bold text-onSurface mb-3">Admin Access Required</h2>
                    <p className="text-onSurfaceVar mb-8">Sign in with an admin account to access this dashboard</p>
                    <Link href="/login" className="btn-sage px-8 py-3 inline-block">Sign In as Admin</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-10 w-72 shimmer rounded-lg mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-64 shimmer rounded-lg" />)}
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: <Users size={18} />, accent: 'sage' },
        { label: 'Total Products', value: (stats?.totalProducts || 0).toLocaleString(), icon: <Package size={18} />, accent: 'stone' },
        { label: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), icon: <ShoppingCart size={18} />, accent: 'sage' },
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={18} />, accent: 'amber' },
    ];

    const accentStyles: Record<string, { bg: string; text: string }> = {
        sage: { bg: 'bg-sage/10', text: 'text-sage' },
        stone: { bg: 'bg-stone/10', text: 'text-stone' },
        amber: { bg: 'bg-amber/10', text: 'text-amber' },
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-sage/10 flex items-center justify-center">
                        <Settings size={20} className="text-sage" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-onSurface">Admin Dashboard</h1>
                        <p className="text-onSurfaceVar text-sm">Welcome back, {user?.firstName}. Here&apos;s your store overview.</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <Link href="/admin/orders" className="btn-ghost text-sm flex items-center gap-2">
                        <ClipboardList size={14} /> Orders
                    </Link>
                    <Link href="/admin/products" className="btn-ghost text-sm flex items-center gap-2">
                        <Package size={14} /> Products
                    </Link>
                    <Link href="/admin/ai" className="btn-sage text-sm flex items-center gap-2">
                        <Brain size={14} /> AI Dashboard
                    </Link>
                </div>
            </div>

            {/* RAG Agent Status */}
            {ragStats && (
                <div className="bg-vc-surface-high rounded-lg border border-sage/10 p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                        <span className="text-sm font-medium text-onSurfaceVar">RAG AI Engine Active</span>
                        <span className="vc-badge vc-badge-sage">
                            {ragStats.totalChunks} knowledge chunks
                        </span>
                        <span className="vc-badge vc-badge-stone">
                            {ragStats.model}
                        </span>
                    </div>
                    <Link href="/admin/ai" className="text-xs text-sage hover:text-sage-dim flex items-center gap-1 transition-colors">
                        View AI Stats <ChevronRight size={12} />
                    </Link>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s) => {
                    const style = accentStyles[s.accent];
                    return (
                        <div key={s.label} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 hover:-translate-y-0.5 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                    <span className={style.text}>{s.icon}</span>
                                </div>
                                <span className="vc-badge vc-badge-sage text-[10px]">
                                    <TrendingUp size={10} /> +12%
                                </span>
                            </div>
                            <div className={`text-2xl font-bold ${style.text} mb-1 stat-number`}>{s.value}</div>
                            <div className="text-[10px] text-outline uppercase tracking-wider font-medium">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Category Distribution + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category Distribution */}
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                    <h3 className="text-base font-semibold text-onSurface mb-6 flex items-center gap-2">
                        <BarChart3 size={16} className="text-sage" /> Category Distribution
                    </h3>
                    <div className="space-y-3">
                        {(stats?.categoryDistribution || []).map((cat: any, i: number) => {
                            const maxCount = Math.max(...(stats?.categoryDistribution || []).map((c: any) => c.count || 0), 1);
                            const pct = ((cat.count || 0) / maxCount) * 100;
                            const barColors = ['bg-sage', 'bg-stone', 'bg-amber', 'bg-sage-dim', 'bg-stone-dim', 'bg-amber-dim'];
                            return (
                                <div key={cat.name} className="group">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-onSurfaceVar font-medium group-hover:text-onSurface transition-colors">{cat.name}</span>
                                        <span className="text-outline text-xs">{cat.count} products</span>
                                    </div>
                                    <div className="h-2 bg-vc-surface rounded-full overflow-hidden">
                                        <div className={`h-full ${barColors[i % barColors.length]} rounded-full transition-all duration-1000`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                    <h3 className="text-base font-semibold text-onSurface mb-6 flex items-center gap-2">
                        <Zap size={16} className="text-amber" /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/admin/orders', icon: <ClipboardList size={20} />, label: 'Manage Orders', desc: 'Update status & view details', accent: 'sage' },
                            { href: '/admin/products', icon: <Package size={20} />, label: 'Manage Products', desc: 'Add, edit, remove products', accent: 'stone' },
                            { href: '/admin/users', icon: <Users size={20} />, label: 'Manage Users', desc: 'View all registered users', accent: 'sage' },
                            { href: '/admin/coupons', icon: <Tag size={20} />, label: 'Manage Coupons', desc: 'Create & manage coupons', accent: 'amber' },
                            { href: '/admin/ai', icon: <Brain size={20} />, label: 'AI Dashboard', desc: 'Health profiles & AI stats', accent: 'sage' },
                            { href: '/ai/chat', icon: <Activity size={20} />, label: 'RAG AI Chat', desc: 'Test Groq-powered chat', accent: 'stone' },
                        ].map(action => {
                            const style = accentStyles[action.accent];
                            return (
                                <Link key={action.href} href={action.href}
                                    className="bg-vc-surface rounded-lg border border-outlineVar/15 p-4 hover:-translate-y-0.5 transition-all group block">
                                    <div className={`${style.text} mb-3 group-hover:scale-110 transition-transform`}>{action.icon}</div>
                                    <div className="text-sm font-semibold text-onSurface mb-0.5">{action.label}</div>
                                    <div className="text-[10px] text-outline">{action.desc}</div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            {stats?.recentProducts?.length > 0 && (
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-onSurface flex items-center gap-2">
                            <Layers size={16} className="text-stone" /> Recently Added Products
                        </h3>
                        <Link href="/admin/products" className="text-xs text-sage hover:text-sage-dim flex items-center gap-1">
                            View All <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-outline text-[10px] uppercase tracking-wider">
                                    <th className="text-left pb-4 font-medium">Product</th>
                                    <th className="text-left pb-4 font-medium">Category</th>
                                    <th className="text-right pb-4 font-medium">Price</th>
                                    <th className="text-right pb-4 font-medium">Rating</th>
                                    <th className="text-right pb-4 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outlineVar/15">
                                {stats.recentProducts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-vc-surface-highest/30 transition-colors group">
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-vc-surface flex items-center justify-center overflow-hidden border border-outlineVar/15">
                                                    {p.imageUrl && p.imageUrl.startsWith('http') ? (
                                                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={14} className="text-outline" />
                                                    )}
                                                </div>
                                                <span className="text-onSurfaceVar font-medium group-hover:text-onSurface transition-colors">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5">
                                            <span className="vc-badge vc-badge-stone">{p.categoryName}</span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <span className="text-onSurface font-semibold">${p.price?.toFixed(2)}</span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, si) => (
                                                        <div key={si} className={`w-1.5 h-1.5 rounded-full mx-[1px] ${si < Math.round(p.averageRating || 0) ? 'bg-amber' : 'bg-vc-surface-bright'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-outline text-xs">{p.averageRating?.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${(p.stock || 0) > 50
                                                ? 'vc-badge-sage'
                                                : (p.stock || 0) > 10
                                                    ? 'vc-badge-amber'
                                                    : 'vc-badge-error'
                                            } vc-badge`}>
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
