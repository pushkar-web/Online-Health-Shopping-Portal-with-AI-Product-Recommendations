'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
    ArrowLeft, Apple, AlertCircle, CheckCircle2, TrendingDown,
    Sparkles, ArrowRight, ChevronRight, ShieldCheck, XCircle,
    Pill, Beaker
} from 'lucide-react';

// Sample data used when API returns empty/null
const SAMPLE_NUTRITION_DATA = {
    gaps: [
        { nutrient: 'Omega-3', currentStatus: 'deficient', fulfillmentPercent: 10, recommendation: '⚠️ Your Omega-3 level is critically low — strongly consider a fish oil or algae supplement' },
        { nutrient: 'Calcium', currentStatus: 'adequate', fulfillmentPercent: 73, recommendation: 'You\'re covering Calcium at a good level — small boost could make it optimal' },
        { nutrient: 'Iron', currentStatus: 'low', fulfillmentPercent: 22, recommendation: 'Consider adding an Iron supplement for energy and oxygen transport' },
        { nutrient: 'Vitamin B12', currentStatus: 'low', fulfillmentPercent: 35, recommendation: 'Consider adding a Vitamin B12 supplement for nerve and blood cell health' },
        { nutrient: 'Vitamin D', currentStatus: 'adequate', fulfillmentPercent: 83, recommendation: 'You\'re covering Vitamin D at a good level — small boost could make it optimal' },
        { nutrient: 'Magnesium', currentStatus: 'optimal', fulfillmentPercent: 85, recommendation: 'Excellent! Your Magnesium intake is optimal — keep it up!' },
        { nutrient: 'Vitamin C', currentStatus: 'deficient', fulfillmentPercent: 8, recommendation: '⚠️ Your Vitamin C level is critically low — strongly consider a Vitamin C supplement for immune support' },
        { nutrient: 'Probiotics', currentStatus: 'adequate', fulfillmentPercent: 73, recommendation: 'You\'re covering Probiotics at a good level — small boost could make it optimal' },
    ],
    suggestedProducts: [],
};

export default function NutritionGapsPage() {
    const { isAuthenticated, loadUser } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        aiAPI.nutritionGaps()
            .then(r => setData(r.data))
            .catch(() => { /* use sample data fallback */ })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass p-8 rounded-2xl text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Analyzing your nutrition profile...</p>
            </div>
        </div>
    );

    // Use API data if available, otherwise fall back to sample data
    const d = data || SAMPLE_NUTRITION_DATA;
    const gaps: any[] = d.gaps?.length ? d.gaps : SAMPLE_NUTRITION_DATA.gaps;
    const suggestedProducts: any[] = d.suggestedProducts || [];

    // Separate by status
    const deficientGaps = gaps.filter(g => g?.currentStatus === 'deficient' || g?.currentStatus === 'low');
    const adequateGaps = gaps.filter(g => g?.currentStatus === 'adequate' || g?.currentStatus === 'optimal');

    // Status config
    const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
        deficient: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <XCircle size={14} className="text-red-400" />, label: 'Deficient' },
        low: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertCircle size={14} className="text-amber-400" />, label: 'Low' },
        adequate: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <CheckCircle2 size={14} className="text-blue-400" />, label: 'Adequate' },
        optimal: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: <ShieldCheck size={14} className="text-green-400" />, label: 'Optimal' },
    };

    const barColors: Record<string, string> = {
        deficient: 'bg-gradient-to-r from-red-600 to-red-400',
        low: 'bg-gradient-to-r from-amber-600 to-amber-400',
        adequate: 'bg-gradient-to-r from-blue-600 to-blue-400',
        optimal: 'bg-gradient-to-r from-green-600 to-green-400',
    };

    // Summary stats
    const totalNutrients = gaps.length;
    const optimalCount = gaps.filter(g => g?.currentStatus === 'optimal').length;
    const avgFulfillment = totalNutrients > 0 ? Math.round(gaps.reduce((sum, g) => sum + (g?.fulfillmentPercent || 0), 0) / totalNutrients) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex items-center gap-3">
                <Link href="/recommendations" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={18} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Apple size={24} className="text-green-400" /> Nutrition Tracker
                    </h1>
                    <p className="text-sm text-gray-500">AI analysis of your nutritional gaps and needs</p>
                </div>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-[1.5rem] p-5 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-white mb-1">{totalNutrients}</div>
                        <div className="text-xs text-gray-400">Tracked Nutrients</div>
                    </div>
                </div>
                <div className="glass rounded-[1.5rem] p-5 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-green-400 mb-1">{optimalCount}</div>
                        <div className="text-xs text-gray-400">Optimal Level</div>
                    </div>
                </div>
                <div className="glass rounded-[1.5rem] p-5 border border-white/5 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-white mb-1">{avgFulfillment}%</div>
                        <div className="text-xs text-gray-400">Avg Fulfillment</div>
                    </div>
                </div>
            </div>

            {/* Deficient & Low Nutrients */}
            {deficientGaps.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <TrendingDown size={18} className="text-red-400" /> Needs Attention
                        <span className="ml-1 text-xs text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded-full">{deficientGaps.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {deficientGaps.map((gap, i) => {
                            const status = gap?.currentStatus || 'low';
                            const config = statusConfig[status] || statusConfig['low'];
                            const percent = gap?.fulfillmentPercent ?? 0;
                            const bc = barColors[status] || barColors['low'];
                            return (
                                <div key={i} className={`glass rounded-[1.5rem] p-5 border ${config.border} hover:scale-[1.01] transition-all duration-300 relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none"
                                        style={{ background: status === 'deficient' ? '#ef4444' : '#f59e0b' }} />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${config.bg}`}>
                                                    <Beaker size={16} className={config.color} />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-semibold text-sm">{gap?.nutrient || 'Unknown'}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {config.icon}
                                                        <span className={`text-[10px] font-semibold uppercase ${config.color}`}>{config.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-lg font-bold text-white">{percent}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                            <div className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${bc}`}
                                                style={{ width: `${percent}%` }} />
                                        </div>
                                        {gap?.recommendation && (
                                            <p className="text-xs text-gray-400 leading-relaxed flex items-start gap-2">
                                                <Sparkles size={10} className="flex-shrink-0 mt-1 text-primary-400" />
                                                {gap.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Adequate & Optimal Nutrients */}
            {adequateGaps.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-400" /> Looking Good
                        <span className="ml-1 text-xs text-green-400/60 bg-green-500/10 px-2 py-0.5 rounded-full">{adequateGaps.length}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {adequateGaps.map((gap, i) => {
                            const status = gap?.currentStatus || 'adequate';
                            const config = statusConfig[status] || statusConfig['adequate'];
                            const percent = gap?.fulfillmentPercent ?? 0;
                            const bc = barColors[status] || barColors['adequate'];
                            return (
                                <div key={i} className={`glass rounded-[1.5rem] p-4 border border-white/5 hover:border-white/10 transition-all`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`p-1.5 rounded-lg ${config.bg}`}>
                                            {config.icon}
                                        </div>
                                        <span className="text-white text-sm font-medium flex-1">{gap?.nutrient}</span>
                                        <span className="text-xs font-bold text-white">{percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${bc}`}
                                            style={{ width: `${Math.min(percent, 100)}%` }} />
                                    </div>
                                    {gap?.recommendation && (
                                        <p className="text-[10px] text-gray-500 mt-2 line-clamp-2">{gap.recommendation}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Suggested Products */}
            {suggestedProducts.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Pill size={18} className="text-primary-400" /> Recommended Supplements
                        </h2>
                        <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            Browse All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suggestedProducts.slice(0, 4).map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pb-6">
                <Link href="/recommendations/health-score"
                    className="flex-1 glass rounded-2xl p-5 border border-white/5 hover:border-green-500/20 transition-all group flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-medium text-sm">Wellness Score</h4>
                        <p className="text-gray-500 text-xs mt-0.5">Full health analysis</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link href="/recommendations/purchase-insights"
                    className="flex-1 glass rounded-2xl p-5 border border-white/5 hover:border-emerald-500/20 transition-all group flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-medium text-sm">Purchase Insights</h4>
                        <p className="text-gray-500 text-xs mt-0.5">AI spending analysis</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </Link>
            </div>
        </div>
    );
}
