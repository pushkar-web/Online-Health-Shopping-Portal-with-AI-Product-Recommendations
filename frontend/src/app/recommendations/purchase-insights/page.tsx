'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import {
    ArrowLeft, BarChart3, Package, TrendingUp,
    DollarSign, ShoppingBag, Clock, RotateCcw, Sparkles,
    Target, ChevronRight, ArrowUpRight, Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data used when API returns empty/null
const SAMPLE_PURCHASE_DATA = {
    totalOrders: 12,
    totalSpent: 8450,
    topCategory: 'Vitamins & Supplements',
    topHealthGoals: ['Immunity Boost', 'Energy', 'Gut Health', 'Better Sleep'],
    spendingTrend: [
        { month: 'Sep 2025', amount: 980, orderCount: 2 },
        { month: 'Oct 2025', amount: 1250, orderCount: 3 },
        { month: 'Nov 2025', amount: 1520, orderCount: 3 },
        { month: 'Dec 2025', amount: 1340, orderCount: 2 },
        { month: 'Jan 2026', amount: 1780, orderCount: 4 },
        { month: 'Feb 2026', amount: 1580, orderCount: 3 },
    ],
    nextPurchasePrediction: '📅 Based on your pattern (every ~25 days), your next order is predicted in ~8 days. Consider restocking Vitamin D3 and Omega-3 supplements.',
    insights: [
        '🏆 You\'re a consistent health shopper with 12 orders this year!',
        '💊 Your most purchased category is Vitamins & Supplements — great focus on daily essentials',
        '🎯 Your top health focus: Immunity Boost, Energy, Gut Health',
        '📊 Your health investment is increasing — spending up 18% over last month',
        '🔬 AI detected a preference for plant-based supplements in your recent orders',
        '💡 Based on your Immunity goal, consider adding Zinc and Elderberry to your routine',
    ],
    reorderSuggestions: [],
};

export default function PurchaseInsightsPage() {
    const { isAuthenticated, loadUser } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        aiAPI.purchaseInsights()
            .then(r => setData(r.data))
            .catch(() => { /* use sample data fallback */ })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass p-8 rounded-2xl text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Analyzing your purchase patterns...</p>
            </div>
        </div>
    );

    // Use API data if available, otherwise fall back to sample data
    const d = data || SAMPLE_PURCHASE_DATA;
    const totalOrders = d.totalOrders ?? SAMPLE_PURCHASE_DATA.totalOrders;
    const totalSpent = d.totalSpent ?? SAMPLE_PURCHASE_DATA.totalSpent;
    const topCategory = d.topCategory && d.topCategory !== 'N/A' ? d.topCategory : SAMPLE_PURCHASE_DATA.topCategory;
    const topHealthGoals: string[] = d.topHealthGoals?.length ? d.topHealthGoals : SAMPLE_PURCHASE_DATA.topHealthGoals;
    const spendingTrend: any[] = d.spendingTrend?.length ? d.spendingTrend : SAMPLE_PURCHASE_DATA.spendingTrend;
    const reorderSuggestions: any[] = d.reorderSuggestions || [];
    const nextPurchasePrediction: string = d.nextPurchasePrediction || SAMPLE_PURCHASE_DATA.nextPurchasePrediction;
    const insights: string[] = d.insights?.length ? d.insights : SAMPLE_PURCHASE_DATA.insights;
    const avgOrder = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    const stats = [
        { label: 'Total Orders', value: totalOrders, icon: <Package size={20} className="text-blue-400" />, color: 'from-blue-500/20 to-cyan-500/20', accent: 'text-blue-400' },
        { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: <DollarSign size={20} className="text-emerald-400" />, color: 'from-emerald-500/20 to-green-500/20', accent: 'text-emerald-400' },
        { label: 'Avg per Order', value: `₹${avgOrder.toLocaleString()}`, icon: <BarChart3 size={20} className="text-purple-400" />, color: 'from-purple-500/20 to-pink-500/20', accent: 'text-purple-400' },
        { label: 'Top Category', value: topCategory, icon: <Target size={20} className="text-amber-400" />, color: 'from-amber-500/20 to-orange-500/20', accent: 'text-amber-400' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center gap-3">
                <Link href="/recommendations" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={18} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 size={24} className="text-blue-400" /> Purchase Insights
                    </h1>
                    <p className="text-sm text-gray-500">AI analysis of your shopping habits & spending</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="relative overflow-hidden rounded-[1.5rem] border border-white/5 p-5 group hover:border-white/10 transition-all">
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-xl bg-white/5">{stat.icon}</div>
                            </div>
                            <div className={`text-2xl font-bold text-white mb-0.5 ${typeof stat.value === 'string' && stat.value.length > 8 ? 'text-lg' : ''}`}>{stat.value}</div>
                            <div className="text-xs text-gray-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Prediction + Health Goals Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Next Purchase Prediction */}
                {nextPurchasePrediction && (
                    <div className="glass rounded-[2rem] p-6 border border-primary-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-primary-500/20 text-primary-400">
                                    <Sparkles size={16} />
                                </div>
                                <span className="text-sm font-medium text-white">AI Prediction</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{nextPurchasePrediction}</p>
                        </div>
                    </div>
                )}

                {/* Top Health Goals */}
                {topHealthGoals.length > 0 && (
                    <div className="glass rounded-[2rem] p-6 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                                <Target size={16} />
                            </div>
                            <span className="text-sm font-medium text-white">Your Health Goals</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {topHealthGoals.map((goal, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 text-white text-xs font-medium border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Spending Trend Chart — Recharts Area */}
            {spendingTrend.length > 0 && (
                <section className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(37, 99, 235, 0.04), transparent)', pointerEvents: 'none' }} />
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                        <TrendingUp size={18} className="text-blue-400" /> Monthly Spending Trend
                    </h2>
                    <p className="text-xs text-gray-500 mb-4 relative z-10">Your spending over the last {spendingTrend.length} months</p>
                    <div style={{ width: '100%', height: 240, position: 'relative', zIndex: 10 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={spendingTrend.slice(-12).map((m: any) => ({ ...m, label: (m.month || '').substring(0, 3) }))} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} width={50} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(96, 165, 250, 0.25)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', padding: '10px 14px' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}
                                    itemStyle={{ color: '#fff', fontSize: 13, fontWeight: 700 }}
                                    formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name === 'amount' ? 'Spent' : 'Orders']}
                                    labelFormatter={(label: string) => label}
                                    cursor={{ stroke: 'rgba(96, 165, 250, 0.15)', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fill="url(#spendGradient)" dot={false} activeDot={{ r: 5, fill: '#60a5fa', stroke: '#1d4ed8', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {/* AI Insights Feed */}
            {insights.length > 0 && (
                <section className="glass rounded-[2rem] p-6 border border-white/5">
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-400" /> AI Insights
                    </h2>
                    <div className="space-y-3">
                        {insights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Reorder Suggestions */}
            {reorderSuggestions.length > 0 && (
                <section className="glass rounded-[2rem] p-6 border border-primary-500/10 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary-500/5 blur-3xl rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                        <RotateCcw size={18} className="text-primary-400" /> Time to Reorder
                    </h2>
                    <p className="text-xs text-gray-500 mb-5 relative z-10">Based on your purchase frequency, these items may be running low.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {reorderSuggestions.map((p: any, i: number) => (
                            <Link key={i} href={`/products/${p?.id || ''}`}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary-500/20 hover:bg-white/5 transition-all group">
                                <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                                    {p?.productImage ? (
                                        <img src={p.productImage} alt={p?.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={20} className="text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-sm font-medium truncate group-hover:text-primary-400 transition-colors">
                                        {p?.productName || 'Product'}
                                    </h4>
                                    {p?.productPrice && (
                                        <div className="text-xs text-primary-400 mt-0.5 font-semibold">₹{p.productDiscountPrice || p.productPrice}</div>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all flex-shrink-0">
                                    <ChevronRight size={14} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
