'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import StatsCard from '@/components/StatsCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') { setLoading(false); return; }
        adminAPI.getStats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, [isAuthenticated, user]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔐</span>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
                <p className="text-gray-400 mb-6">Sign in with an admin account to access this page</p>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In as Admin</Link>
            </div>
        );
    }

    if (loading) return <LoadingSpinner text="Loading dashboard..." size="lg" />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-3xl">⚙️</span>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {user?.firstName}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/orders" className="btn-outline px-6 py-2.5">
                        📋 Manage Orders
                    </Link>
                    <Link href="/admin/products" className="btn-primary px-6 py-2.5">
                        📦 Manage Products
                    </Link>
                    <Link href="/admin/ai" className="btn-accent px-6 py-2.5">
                        🧠 AI Dashboard
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard icon="👥" label="Total Users" value={stats?.totalUsers || 0} color="blue" trend="+12%" />
                <StatsCard icon="📦" label="Total Products" value={stats?.totalProducts || 0} color="purple" trend="+5" />
                <StatsCard icon="🛒" label="Total Orders" value={stats?.totalOrders || 0} color="green" trend="+23%" />
                <StatsCard icon="💰" label="Total Revenue" value={stats?.totalRevenue || 0} prefix="$" color="amber" trend="+18%" />
            </div>

            {/* Category Distribution + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category Distribution */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">📊 Category Distribution</h3>
                    <div className="space-y-3">
                        {(stats?.categoryDistribution || []).map((cat: any) => {
                            const maxCount = Math.max(...(stats?.categoryDistribution || []).map((c: any) => c.count || 0), 1);
                            const pct = ((cat.count || 0) / maxCount) * 100;
                            return (
                                <div key={cat.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">{cat.name}</span>
                                        <span className="text-gray-500">{cat.count} products</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary-500 to-health-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">⚡ Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/admin/orders', icon: '📋', label: 'Manage Orders', desc: 'Update status & view' },
                            { href: '/admin/products', icon: '📦', label: 'Manage Products', desc: 'Add, edit, remove' },
                            { href: '/recommendations', icon: '🤖', label: 'AI Insights', desc: 'View engine logic' },
                            { href: '/symptom-search', icon: '💊', label: 'Symptom Search', desc: 'Test AI chat' },
                        ].map(action => (
                            <Link key={action.href} href={action.href}
                                className="glass-light rounded-xl p-4 hover-card group block border border-transparent hover:border-white/10">
                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{action.icon}</span>
                                <div className="text-sm font-semibold text-white">{action.label}</div>
                                <div className="text-xs text-gray-500">{action.desc}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            {stats?.recentProducts?.length > 0 && (
                <div className="glass rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">🆕 Recently Added Products</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase">
                                    <th className="text-left pb-3 font-medium">Product</th>
                                    <th className="text-left pb-3 font-medium">Category</th>
                                    <th className="text-right pb-3 font-medium">Price</th>
                                    <th className="text-right pb-3 font-medium">Rating</th>
                                    <th className="text-right pb-3 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.recentProducts.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-sm">
                                                    {p.imageUrl && p.imageUrl.startsWith('http') ? (
                                                        <img src={p.imageUrl} alt="" className="w-full h-full rounded object-cover" />
                                                    ) : '💊'}
                                                </div>
                                                <span className="text-gray-300 font-medium">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-500">{p.categoryName}</td>
                                        <td className="py-3 text-right text-gray-300">${p.price?.toFixed(2)}</td>
                                        <td className="py-3 text-right">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-gray-400 ml-1">{p.averageRating?.toFixed(1)}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <span className={`badge ${(p.stock || 0) > 20 ? 'badge-green' : 'badge-amber'}`}>{p.stock}</span>
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
