'use client';
import { useEffect, useState } from 'react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { recommendAPI, aiAPI, orderAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import {
    Sparkles, Target, Heart, ShoppingCart, Package, TrendingUp,
    Lightbulb, RefreshCw, ArrowRight, Zap, Clock, User, ChevronRight,
    Activity, Apple, ArrowUpRight, ShoppingBag, BarChart3, Shield,
    Star, Flame, Brain, Moon, Droplets
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ---- Sample fallback data for when API returns empty/null ----
const SAMPLE_SCORE = {
    overallScore: 63, grade: 'B', summary: 'Good progress! Improve your nutrition coverage and product diversity.',
    dimensions: [
        { name: 'Profile Completeness', score: 95, status: 'excellent' },
        { name: 'Goal Alignment', score: 48, status: 'fair' },
        { name: 'Nutrition Coverage', score: 42, status: 'fair' },
        { name: 'Purchase Consistency', score: 72, status: 'good' },
        { name: 'Product Diversity', score: 58, status: 'fair' },
    ],
    improvements: ['Focus on immunity-boosting supplements', 'Diversify across more categories', 'Maintain your reorder consistency'],
};
const SAMPLE_INSIGHTS = {
    spendingTrend: [
        { month: 'Sep 2025', amount: 980, orderCount: 2 }, { month: 'Oct 2025', amount: 1250, orderCount: 3 },
        { month: 'Nov 2025', amount: 1520, orderCount: 3 }, { month: 'Dec 2025', amount: 1340, orderCount: 2 },
        { month: 'Jan 2026', amount: 1780, orderCount: 4 }, { month: 'Feb 2026', amount: 1580, orderCount: 3 },
    ],
    insights: [
        '🏆 You\'re a consistent health shopper this year!',
        '💊 Top category: Vitamins & Supplements',
        '📊 Spending up 18% vs last month',
        '🎯 Health focus: Immunity, Energy, Gut Health',
    ],
    totalOrders: 12, totalSpent: 8450,
};
const SAMPLE_TIPS = [
    { title: '💧 Stay Hydrated', content: 'Drink at least 8 glasses of water daily for optimal health.' },
    { title: '🧘 Mind & Body', content: 'Take 10 minutes of deep breathing exercises each morning.' },
    { title: '🥗 Eat Colorful', content: 'Include at least 3 different colored vegetables in each meal.' },
];

export default function RecommendationsPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const { items: cartItems, fetchCart } = useCartStore();
    const { items: wishlistItems, fetchWishlist } = useWishlistStore();

    const [recommendations, setRecommendations] = useState<any>(null);
    const [healthScore, setHealthScore] = useState<any>(null);
    const [dailyTips, setDailyTips] = useState<any[]>([]);
    const [purchaseInsights, setPurchaseInsights] = useState<any>(null);
    const [healthInsights, setHealthInsights] = useState<any>(null);
    const [orderProducts, setOrderProducts] = useState<any[]>([]);
    const [fbtProducts, setFbtProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTipIdx, setActiveTipIdx] = useState(0);

    useEffect(() => { loadUser(); }, []);

    const fetchAllData = async () => {
        const userId = user?.userId || user?.id;
        if (!isAuthenticated || !userId) return;

        try {
            const [recsRes, scoreRes, tipsRes, insightsRes, ordersRes, hiRes] = await Promise.allSettled([
                recommendAPI.get(userId),
                aiAPI.healthScore(),
                aiAPI.dailyTips(),
                aiAPI.purchaseInsights(),
                orderAPI.history(0, 5),
                aiAPI.healthInsights(),
            ]);

            if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data);
            if (scoreRes.status === 'fulfilled') setHealthScore(scoreRes.value.data);
            if (tipsRes.status === 'fulfilled') setDailyTips(tipsRes.value.data || []);
            if (insightsRes.status === 'fulfilled') setPurchaseInsights(insightsRes.value.data);
            if (hiRes.status === 'fulfilled') setHealthInsights(hiRes.value.data);

            if (ordersRes.status === 'fulfilled') {
                const orders = ordersRes.value.data?.content || ordersRes.value.data || [];
                const products: any[] = [];
                const seenIds = new Set();
                orders.forEach((order: any) => {
                    (order.items || []).forEach((item: any) => {
                        if (item.productId && !seenIds.has(item.productId)) {
                            seenIds.add(item.productId);
                            products.push({
                                id: item.productId,
                                productName: item.productName,
                                productPrice: item.unitPrice || item.productPrice,
                                productImage: item.productImage,
                                quantity: item.quantity,
                            });
                        }
                    });
                });
                setOrderProducts(products);
            }

            await fetchCart();
            await fetchWishlist();

            const currentCartItems = useCartStore.getState().items;
            if (currentCartItems.length > 0) {
                try {
                    const fbtRes = await recommendAPI.fbt(currentCartItems[0].productId);
                    setFbtProducts(fbtRes.data || []);
                } catch { }
            }
        } catch (err) {
            console.error("Error fetching recommendation data", err);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !(user?.userId || user?.id)) return;
        setLoading(true);
        fetchAllData().finally(() => setLoading(false));
    }, [isAuthenticated, user?.userId, user?.id]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        setRefreshing(false);
    };

    // Cycle daily tips
    useEffect(() => {
        if (dailyTips.length <= 1) return;
        const interval = setInterval(() => setActiveTipIdx(i => (i + 1) % dailyTips.length), 8000);
        return () => clearInterval(interval);
    }, [dailyTips.length]);

    if (loading) return <LoadingSpinner text="Building your health dashboard..." size="lg" />;

    // Use API data with sample fallbacks
    const hs = healthScore || SAMPLE_SCORE;
    const pi = purchaseInsights || SAMPLE_INSIGHTS;
    const currentScore = hs.overallScore ?? SAMPLE_SCORE.overallScore;
    const currentWishlist = useWishlistStore.getState().items || [];
    const currentCart = useCartStore.getState().items || [];
    const dimensions: any[] = hs.dimensions?.length ? hs.dimensions : SAMPLE_SCORE.dimensions;
    const improvements: string[] = hs.improvements?.length ? hs.improvements : SAMPLE_SCORE.improvements;
    const spendingTrend: any[] = pi.spendingTrend?.length ? pi.spendingTrend : SAMPLE_INSIGHTS.spendingTrend;
    const aiInsights: string[] = pi.insights?.length ? pi.insights : SAMPLE_INSIGHTS.insights;
    const personalizedPicks: any[] = healthInsights?.personalizedPicks || [];
    const activeTips = dailyTips.length > 0 ? dailyTips : SAMPLE_TIPS;

    // Dimension icons
    const dimIcons: Record<string, any> = {
        'Nutrition': <Flame size={14} className="text-orange-400" />,
        'Fitness': <Activity size={14} className="text-green-400" />,
        'Hydration': <Droplets size={14} className="text-blue-400" />,
        'Sleep': <Moon size={14} className="text-indigo-400" />,
        'Mental Health': <Brain size={14} className="text-purple-400" />,
        'Supplements': <Shield size={14} className="text-cyan-400" />,
    };

    // Empty State
    if (!loading && user && !user.age && !healthScore) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="glass p-10 rounded-2xl max-w-lg w-full text-center border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 pointer-events-none" />
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <User size={36} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Complete Your Profile</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">Unlock your personalized health dashboard. We'll analyze your goals and needs to provide tailored recommendations.</p>
                    <Link href="/profile" className="btn-primary w-full py-4 text-lg shadow-lg shadow-primary-500/30 block group relative overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Set Up Health Profile <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Sparkles size={28} className="text-primary-400" />
                        Health Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Welcome back, {user?.firstName || user?.name}. Here's your wellness overview.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleRefresh} disabled={refreshing}
                        className="btn-outline text-sm flex items-center gap-2 bg-white/5 hover:bg-white/10 border-white/10">
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    <Link href="/ai/chat" className="btn-primary text-sm flex items-center gap-2 shadow-lg shadow-primary-500/20">
                        <Zap size={14} fill="currentColor" /> AI Health Chat
                    </Link>
                </div>
            </header>

            {/* ===== ROW 1: Bento Grid ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">

                {/* 1. Health Score Card (Span 2) */}
                <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] border border-white/10 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentScore >= 80 ? 'from-green-500/30 to-emerald-500/0' : currentScore >= 60 ? 'from-yellow-500/30 to-amber-500/0' : 'from-red-500/30 to-orange-500/0'} blur-3xl rounded-full translate-x-1/3 -translate-y-1/3`} />

                    <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-1.5 rounded-lg ${currentScore >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <Activity size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">Wellness Score</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                                    {healthScore?.grade || (currentScore >= 80 ? 'Excellent' : currentScore >= 60 ? 'Good' : 'Needs Work')}
                                </h2>
                                <p className="text-gray-400 text-sm">{healthScore?.summary?.substring(0, 80) || 'Complete your profile for AI analysis'}...</p>
                            </div>

                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                                <svg className="w-full h-full -rotate-90 transform drop-shadow-2xl" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                    <circle cx="60" cy="60" r="52" fill="none"
                                        stroke={currentScore >= 80 ? '#22c55e' : currentScore >= 60 ? '#eab308' : '#ef4444'}
                                        strokeWidth="12" strokeLinecap="round"
                                        strokeDasharray={`${(currentScore / 100) * 327} 327`}
                                        className="transition-all duration-1000 ease-out" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl sm:text-3xl font-bold text-white">{currentScore}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <Link href="/recommendations/health-score" className="glass-light px-4 py-2 rounded-full text-xs font-medium text-white hover:bg-white/20 transition-colors flex items-center gap-1">
                                Full Analysis <ArrowRight size={12} />
                            </Link>
                            <Link href="/recommendations/nutrition-gaps" className="glass-light px-4 py-2 rounded-full text-xs font-medium text-white hover:bg-white/20 transition-colors flex items-center gap-1">
                                Nutrition Tracker <Apple size={12} className="text-green-400" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Daily Tip Card (rotates) */}
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gray-900/50 hover:bg-gray-800/50 transition-colors p-6 flex flex-col justify-between">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/20 blur-2xl rounded-full" />
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                                <Lightbulb size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-300">Daily Insight</span>
                        </div>
                        {dailyTips.length > 0 ? (
                            <>
                                <h3 className="text-white font-medium mb-2 leading-tight">{dailyTips[activeTipIdx]?.title || 'Healthy Habit'}</h3>
                                <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed">{dailyTips[activeTipIdx]?.description || dailyTips[activeTipIdx]}</p>
                            </>
                        ) : (
                            <p className="text-xs text-gray-500">Check back later for personalized health tips.</p>
                        )}
                    </div>
                    {dailyTips.length > 1 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md">{dailyTips[activeTipIdx]?.category || 'AI Tip'}</span>
                            <div className="flex gap-1">
                                {dailyTips.slice(0, Math.min(dailyTips.length, 5)).map((_, i) => (
                                    <button key={i} onClick={() => setActiveTipIdx(i)}
                                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeTipIdx ? 'bg-primary-500 w-4' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Quick Stats Column */}
                <div className="grid grid-rows-2 gap-4">
                    <div className="glass rounded-[2rem] p-5 border border-white/10 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-blue-500/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Package size={18} /></div>
                                <span className="text-xs text-gray-400 font-medium">Orders</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{purchaseInsights?.totalOrders || 0}</div>
                            <Link href="/orders" className="text-[10px] text-blue-300 hover:text-blue-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                View Orders <ChevronRight size={10} />
                            </Link>
                        </div>
                    </div>
                    <div className="glass rounded-[2rem] p-5 border border-white/10 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-pink-500/10 to-transparent" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400"><Heart size={18} /></div>
                                <span className="text-xs text-gray-400 font-medium">Wishlist</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{currentWishlist.length}</div>
                            <Link href="/wishlist" className="text-[10px] text-pink-300 hover:text-pink-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                View Items <ChevronRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== ROW 2: NEW WIDGETS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

                {/* W1: Nutrition Radar — Score Dimensions */}
                {dimensions.length > 0 && (
                    <div className="glass rounded-[2rem] p-6 border border-white/5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Activity size={16} className="text-primary-400" /> Wellness Dimensions
                            </h3>
                            <Link href="/recommendations/health-score" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                                Details <ArrowUpRight size={12} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {dimensions.map((dim: any, i: number) => {
                                const score = dim?.score ?? 0;
                                const statusColors: Record<string, string> = {
                                    excellent: 'text-green-400 bg-green-500/10',
                                    good: 'text-blue-400 bg-blue-500/10',
                                    fair: 'text-yellow-400 bg-yellow-500/10',
                                    poor: 'text-red-400 bg-red-500/10',
                                };
                                const barColors: Record<string, string> = {
                                    excellent: 'bg-green-500', good: 'bg-blue-500', fair: 'bg-yellow-500', poor: 'bg-red-500',
                                };
                                const sc = statusColors[dim?.status] || 'text-gray-400 bg-white/5';
                                const bc = barColors[dim?.status] || 'bg-gray-500';
                                return (
                                    <div key={i} className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-2 mb-3">
                                            {dimIcons[dim?.name] || <Star size={14} className="text-gray-400" />}
                                            <span className="text-xs font-medium text-gray-300">{dim?.name}</span>
                                        </div>
                                        <div className="flex items-end justify-between mb-2">
                                            <span className="text-xl font-bold text-white">{score}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${sc}`}>
                                                {dim?.status}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${bc}`} style={{ width: `${score}%` }} />
                                        </div>
                                        {dim?.tip && <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">{dim.tip}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* W2: Next Purchase Prediction */}
                <div className="glass rounded-[2rem] p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-purple-500/10 blur-2xl rounded-full" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                                <Sparkles size={16} />
                            </div>
                            <span className="text-sm font-medium text-white">AI Prediction</span>
                        </div>
                        {purchaseInsights?.nextPurchasePrediction ? (
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">{purchaseInsights.nextPurchasePrediction}</p>
                        ) : (
                            <p className="text-gray-500 text-xs">Shop more to get AI purchase predictions.</p>
                        )}
                    </div>
                    <Link href="/recommendations/purchase-insights" className="relative z-10 mt-auto pt-4 border-t border-white/5 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                        View Purchase Insights <ArrowRight size={12} />
                    </Link>
                </div>
            </div>

            {/* ===== ROW 3: Spending + Cart + Insights ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">

                {/* W3: Spending Trend Mini Chart — Recharts Area */}
                {spendingTrend.length > 0 && (
                    <div className="md:col-span-2 glass rounded-[2rem] p-5 border border-white/5 relative overflow-hidden">
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(5, 150, 105, 0.04), transparent)', pointerEvents: 'none' }} />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <BarChart3 size={16} className="text-emerald-400" /> Spending Trend
                            </h3>
                            <span className="text-[10px] text-gray-500">Last {Math.min(spendingTrend.length, 6)} months</span>
                        </div>
                        <div style={{ width: '100%', height: 140, position: 'relative', zIndex: 10 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingTrend.slice(-6).map((m: any) => ({ ...m, label: (m.month || '').substring(0, 3) }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="overviewSpendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} dy={4} />
                                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} width={40} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', padding: '8px 12px' }}
                                        labelStyle={{ color: '#94a3b8', fontSize: 10, marginBottom: 2 }}
                                        itemStyle={{ color: '#fff', fontSize: 12, fontWeight: 700 }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
                                        cursor={{ stroke: 'rgba(52, 211, 153, 0.15)', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#34d399" strokeWidth={2} fill="url(#overviewSpendGrad)" dot={false} activeDot={{ r: 4, fill: '#6ee7b7', stroke: '#059669', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] relative z-10">
                            <span className="text-gray-500">Total: ₹{(purchaseInsights?.totalSpent || 0).toLocaleString()}</span>
                            <Link href="/recommendations/purchase-insights" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                Full Report <ArrowUpRight size={10} />
                            </Link>
                        </div>
                    </div>
                )}

                {/* Cart Actions */}
                <div className="glass rounded-[2rem] p-6 border border-white/10 flex flex-col justify-between group hover:bg-white/5 transition-colors">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCart size={18} className="text-white" />
                            <span className="text-sm font-medium text-white">Your Cart</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{currentCart.length}</div>
                        <div className="text-xs text-gray-400">items pending</div>
                    </div>
                    <Link href="/cart" className="mt-4 w-full py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                        Checkout Now <ArrowRight size={12} />
                    </Link>
                </div>

                {/* W4: Health Goal Progress / Improvements */}
                {improvements.length > 0 && (
                    <div className="glass rounded-[2rem] p-6 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                                <Target size={16} />
                            </div>
                            <span className="text-sm font-medium text-white">To Improve</span>
                        </div>
                        <div className="space-y-2.5">
                            {improvements.slice(0, 4).map((tip, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-xs">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ===== ROW 4: AI Insights Feed ===== */}
            {aiInsights.length > 0 && (
                <div className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 via-primary-500 to-purple-500 opacity-40" />
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
                        <Sparkles size={16} className="text-amber-400" /> AI Shopping Insights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {aiInsights.slice(0, 6).map((insight, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb size={12} className="text-amber-400" />
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== ROW 5: Personalized Picks (from healthInsights) ===== */}
            {personalizedPicks.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star size={20} className="text-yellow-400" /> Personalized For You
                        </h2>
                        <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">See All</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {personalizedPicks.slice(0, 4).map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* ===== Recommendations Sections ===== */}
            <div className="space-y-12 pb-12">
                {/* Based on Goals */}
                {recommendations?.basedOnGoals?.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Target size={20} className="text-red-400" /> Based on Your Goals
                            </h2>
                            <Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">Manage Goals</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendations.basedOnGoals.slice(0, 4).map((p: any) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Bundles + Seasonal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {recommendations?.bundledProducts?.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <Zap size={20} className="text-yellow-400" /> Smart Bundles
                            </h2>
                            <div className="space-y-4">
                                {recommendations.bundledProducts.slice(0, 2).map((bundle: any, i: number) => (
                                    <div key={i} className="glass p-5 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-colors group cursor-pointer border border-white/5">
                                        <div className="flex -space-x-3">
                                            {bundle.products?.slice(0, 3).map((p: any, idx: number) => (
                                                <div key={idx} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-gray-800 overflow-hidden">
                                                    {p.productImage ? <img src={p.productImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium text-sm group-hover:text-primary-400 transition-colors">{bundle.bundleName}</h4>
                                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{bundle.reason}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-emerald-400 font-bold text-sm">₹{bundle.totalPrice}</div>
                                            <div className="text-[10px] text-gray-500 line-through">₹{Math.round(Number(bundle.totalPrice) * 1.15)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {recommendations?.seasonalRecommendations?.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <TrendingUp size={20} className="text-purple-400" /> {recommendations?.seasonName || 'Trending Now'}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {recommendations.seasonalRecommendations.slice(0, 2).map((p: any) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Buy Again */}
                {orderProducts.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                            <Clock size={20} className="text-blue-400" /> Buy Again
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {orderProducts.slice(0, 8).map((p: any) => (
                                <div key={p.id} className="min-w-[160px] glass p-4 rounded-xl border border-white/5 flex flex-col items-center text-center group hover:border-white/20 transition-all">
                                    <div className="w-20 h-20 mb-3 rounded-lg overflow-hidden bg-white/5 relative">
                                        {p.productImage ? <img src={p.productImage} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 m-auto text-gray-600 top-1/2 relative -translate-y-1/2" />}
                                        <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <ShoppingBag size={16} className="text-white" />
                                        </button>
                                    </div>
                                    <h4 className="text-white text-xs font-medium truncate w-full">{p.productName}</h4>
                                    <div className="text-primary-400 text-xs mt-1">₹{p.productPrice}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
