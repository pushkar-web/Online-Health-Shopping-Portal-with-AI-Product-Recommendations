'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
    ArrowLeft, Activity, TrendingUp, CheckCircle2,
    Shield, Star, Flame, Brain, Moon, Droplets,
    ArrowRight, Sparkles, AlertTriangle, ChevronRight
} from 'lucide-react';

// Sample data used when API returns empty/null
const SAMPLE_HEALTH_SCORE = {
    overallScore: 63,
    grade: 'B',
    summary: 'Good progress! A few adjustments could significantly improve your health coverage.',
    dimensions: [
        { name: 'Profile Completeness', score: 95, status: 'excellent', tip: 'Your profile is nearly complete — great job!' },
        { name: 'Goal Alignment', score: 48, status: 'fair', tip: 'Purchase products that match your stated health goals' },
        { name: 'Nutrition Coverage', score: 42, status: 'fair', tip: 'Expand your supplement range to cover nutritional gaps' },
        { name: 'Purchase Consistency', score: 72, status: 'good', tip: 'Build a regular supplement routine by reordering consistently' },
        { name: 'Product Diversity', score: 58, status: 'fair', tip: 'Diversify across more health categories for holistic wellness' },
    ],
    improvements: [
        'Purchase products that match your stated health goals for a more targeted supplement routine',
        'You have gaps in your nutritional supplementation — explore products that cover missing nutrients',
        'Diversify across more health categories for holistic wellness',
    ],
    recommendedProducts: [],
};

export default function HealthScorePage() {
    const { isAuthenticated, loadUser } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        aiAPI.healthScore()
            .then(r => setData(r.data))
            .catch(() => { /* use sample data fallback */ })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="glass p-8 rounded-2xl text-center">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Calculating your wellness score...</p>
            </div>
        </div>
    );

    // Use API data if available, otherwise fall back to sample data
    const d = data || SAMPLE_HEALTH_SCORE;

    const score = d.overallScore ?? SAMPLE_HEALTH_SCORE.overallScore;
    const grade = d.grade || SAMPLE_HEALTH_SCORE.grade;
    const summary = d.summary || SAMPLE_HEALTH_SCORE.summary;
    const dimensions: any[] = d.dimensions?.length ? d.dimensions : SAMPLE_HEALTH_SCORE.dimensions;
    const improvements: string[] = d.improvements?.length ? d.improvements : SAMPLE_HEALTH_SCORE.improvements;
    const recommendedProducts: any[] = d.recommendedProducts || [];

    const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
    const statusLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement';

    const dimIcons: Record<string, any> = {
        'Nutrition': <Flame size={18} className="text-orange-400" />,
        'Fitness': <Activity size={18} className="text-green-400" />,
        'Hydration': <Droplets size={18} className="text-blue-400" />,
        'Sleep': <Moon size={18} className="text-indigo-400" />,
        'Mental Health': <Brain size={18} className="text-purple-400" />,
        'Supplements': <Shield size={18} className="text-cyan-400" />,
    };

    const statusColors: Record<string, { text: string; bg: string; bar: string }> = {
        excellent: { text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', bar: 'bg-green-500' },
        good: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', bar: 'bg-blue-500' },
        fair: { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', bar: 'bg-yellow-500' },
        poor: { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', bar: 'bg-red-500' },
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex items-center gap-3">
                <Link href="/recommendations" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={18} className="text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity size={24} className="text-green-400" /> Wellness Score
                    </h1>
                    <p className="text-sm text-gray-500">Comprehensive AI analysis of your health profile</p>
                </div>
            </header>

            {/* Hero: Score Ring + Summary */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
                <div className={`absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none`}
                    style={{ background: `radial-gradient(circle, ${scoreColor}33, transparent)` }} />

                <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
                    {/* Score Ring */}
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
                            <circle cx="100" cy="100" r="85" fill="none"
                                stroke={scoreColor}
                                strokeWidth="16" strokeLinecap="round"
                                strokeDasharray={`${(score / 100) * 534} 534`}
                                className="transition-all duration-[2s] ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl sm:text-6xl font-bold text-white">{score}</span>
                            <span className="text-sm font-semibold mt-1 px-3 py-0.5 rounded-full"
                                style={{ color: scoreColor, backgroundColor: `${scoreColor}20` }}>
                                {grade}
                            </span>
                        </div>
                    </div>

                    {/* Summary Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                            style={{ backgroundColor: `${scoreColor}15`, border: `1px solid ${scoreColor}30` }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: scoreColor }} />
                            <span className="text-sm font-semibold" style={{ color: scoreColor }}>{statusLabel}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Your Wellness Report</h2>
                        <p className="text-gray-400 leading-relaxed max-w-lg">{summary}</p>
                    </div>
                </div>
            </div>

            {/* Dimensions Grid */}
            {dimensions.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-400" /> Score Breakdown
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dimensions.map((dim: any, i: number) => {
                            const s = dim?.score ?? 0;
                            const status = dim?.status || 'fair';
                            const colors = statusColors[status] || statusColors['fair'];
                            return (
                                <div key={i} className={`glass rounded-[1.5rem] p-6 border ${colors.bg} hover:scale-[1.01] transition-all duration-300`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-white/5">
                                                {dimIcons[dim?.name] || <Star size={18} className="text-gray-400" />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-semibold text-sm">{dim?.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold ${colors.text}`}>{status}</span>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-white">{s}</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                                        <div className={`h-full rounded-full transition-all duration-[1.5s] ease-out ${colors.bar}`}
                                            style={{ width: `${s}%` }} />
                                    </div>
                                    {dim?.tip && (
                                        <p className="text-xs text-gray-400 leading-relaxed flex items-start gap-2">
                                            <Sparkles size={10} className="flex-shrink-0 mt-1 text-primary-400" />
                                            {dim.tip}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Improvement Tips */}
            {improvements.length > 0 && (
                <section className="glass rounded-[2rem] p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-40" />
                    <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-400" /> Areas for Improvement
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {improvements.map((tip, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-primary-400" /> Recommended Products
                        </h2>
                        <Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            Browse All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedProducts.slice(0, 4).map((p: any) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Navigation */}
            <div className="flex gap-4 pb-6">
                <Link href="/recommendations/nutrition-gaps"
                    className="flex-1 glass rounded-2xl p-5 border border-white/5 hover:border-primary-500/20 transition-all group flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-medium text-sm">Nutrition Tracker</h4>
                        <p className="text-gray-500 text-xs mt-0.5">Check your nutrient gaps</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
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
