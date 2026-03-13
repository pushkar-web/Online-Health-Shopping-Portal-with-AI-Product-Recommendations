'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
    Brain, Activity, TrendingUp, Zap, Heart, Shield,
    BarChart3, Target, Sparkles, MessageCircle, GitCompare,
    Pill, ChevronRight, ArrowUpRight, Flame, Droplets, Star
} from 'lucide-react';

export default function AIHealthDashboardPage() {
    const [insights, setInsights] = useState<any>(null);
    const [ragStats, setRagStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user, loadUser } = useAuthStore();

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) { setLoading(false); return; }
        Promise.all([
            aiAPI.healthInsights().catch(() => null),
            aiAPI.ragStats().catch(() => null),
        ]).then(([insightsRes, ragRes]) => {
            if (insightsRes?.data) setInsights(insightsRes.data);
            if (ragRes?.data) setRagStats(ragRes.data);
            setLoading(false);
        });
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                        <Brain size={36} className="text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">AI Health Dashboard</h2>
                    <p className="text-gray-400 mb-8">Sign in to access your personalized health score, nutrition analysis, and AI-powered insights</p>
                    <Link href="/login" className="btn-primary px-8 py-3 inline-block">Sign In to Continue</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-8 w-64 shimmer rounded mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-52 shimmer rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-72 shimmer rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const hs = insights?.healthScore;
    const pi = insights?.purchaseInsights;
    const ng = insights?.nutritionGaps;
    const tips = insights?.dailyTips;

    const gradeConfig: Record<string, { gradient: string; glow: string }> = {
        'A+': { gradient: 'from-emerald-400 to-green-500', glow: 'shadow-emerald-500/30' },
        'A': { gradient: 'from-green-400 to-teal-500', glow: 'shadow-green-500/30' },
        'B+': { gradient: 'from-blue-400 to-cyan-500', glow: 'shadow-blue-500/30' },
        'B': { gradient: 'from-blue-400 to-indigo-500', glow: 'shadow-blue-500/30' },
        'C': { gradient: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-500/30' },
        'D': { gradient: 'from-red-400 to-orange-500', glow: 'shadow-red-500/30' },
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-red-400';
    };

    const getBarColor = (score: number) => {
        if (score >= 80) return 'from-emerald-500 to-green-400';
        if (score >= 60) return 'from-blue-500 to-cyan-400';
        if (score >= 40) return 'from-amber-500 to-yellow-400';
        return 'from-red-500 to-orange-400';
    };

    const dimIcons: Record<string, any> = {
        'Profile Completeness': <Target size={16} />,
        'Goal Alignment': <Flame size={16} />,
        'Nutrition Coverage': <Droplets size={16} />,
        'Purchase Consistency': <TrendingUp size={16} />,
        'Product Diversity': <Star size={16} />,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Brain size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">AI Health Dashboard</h1>
                        <p className="text-gray-400 text-sm">Your personalized health intelligence, powered by AI</p>
                    </div>
                </div>
                <Link href="/ai/chat" className="btn-primary px-5 py-2.5 flex items-center gap-2 text-sm">
                    <MessageCircle size={16} /> AI Chat
                </Link>
            </div>

            {/* RAG Agent Status Bar */}
            {ragStats && (
                <div className="glass rounded-2xl p-4 mb-6 flex items-center justify-between border border-primary-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm text-gray-300">RAG Knowledge Base Active</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                            {ragStats.totalChunks} knowledge chunks
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {ragStats.model}
                        </span>
                    </div>
                    <Link href="/ai/chat" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                        Try RAG Chat <ChevronRight size={12} />
                    </Link>
                </div>
            )}

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {hs && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-500/5 to-transparent rounded-bl-full" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={14} className="text-primary-400" /> AI Health Score
                                </h3>
                                <Link href="/recommendations/health-score" className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5">
                                    Details <ArrowUpRight size={10} />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeConfig[hs.grade]?.gradient || 'from-gray-400 to-gray-500'} flex items-center justify-center shadow-lg ${gradeConfig[hs.grade]?.glow || ''} group-hover:scale-105 transition-transform`}>
                                    <span className="text-3xl font-black text-white drop-shadow-lg">{hs.grade}</span>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">{hs.overallScore}<span className="text-lg text-gray-500">/100</span></div>
                                    <p className="text-[11px] text-gray-500 mt-1 max-w-[180px]">{hs.summary?.split('.')[0]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {pi && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <BarChart3 size={14} className="text-blue-400" /> Purchase Insights
                                </h3>
                                <Link href="/recommendations/purchase-insights" className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5">
                                    Details <ArrowUpRight size={10} />
                                </Link>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{pi.totalOrders} <span className="text-lg text-gray-500">orders</span></div>
                            <div className="text-lg text-gray-300">${pi.totalSpent?.toFixed(2)} <span className="text-sm text-gray-500">total spent</span></div>
                            {pi.topCategory && pi.topCategory !== 'N/A' && (
                                <div className="mt-3"><span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">Top: {pi.topCategory}</span></div>
                            )}
                        </div>
                    </div>
                )}

                {ng && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden group hover-card">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full" />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Shield size={14} className="text-green-400" /> Nutrition Coverage
                                </h3>
                                <Link href="/recommendations/nutrition-gaps" className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5">
                                    Details <ArrowUpRight size={10} />
                                </Link>
                            </div>
                            {(() => {
                                const covered = ng.gaps?.filter((g: any) => g.currentStatus === 'adequate' || g.currentStatus === 'optimal').length || 0;
                                const total = ng.gaps?.length || 1;
                                const pct = Math.round((covered / total) * 100);
                                return (
                                    <>
                                        <div className="text-3xl font-bold text-white mb-1">{pct}%</div>
                                        <div className="text-sm text-gray-400">{covered} of {total} key nutrients covered</div>
                                        <div className="mt-3 w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>

            {/* Health Score Dimensions */}
            {hs?.dimensions && (
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-primary-400" /> Health Score Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {hs.dimensions.map((dim: any) => (
                            <div key={dim.name} className="glass-light rounded-xl p-4 hover:border-white/10 border border-transparent transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-gray-500 group-hover:text-gray-400 transition-colors">{dimIcons[dim.name] || <Activity size={16} />}</span>
                                    <span className={`text-xs font-bold ${getScoreColor(dim.score)}`}>{dim.score}</span>
                                </div>
                                <span className="text-xs font-medium text-gray-300 block mb-3">{dim.name}</span>
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className={`h-2 rounded-full bg-gradient-to-r ${getBarColor(dim.score)} transition-all duration-700`} style={{ width: `${dim.score}%` }} />
                                </div>
                                <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">{dim.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {ng?.gaps && ng.gaps.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                            <Droplets size={20} className="text-cyan-400" /> Nutrition Gap Analysis
                        </h3>
                        <div className="space-y-4">
                            {ng.gaps.map((gap: any) => {
                                const isGood = gap.currentStatus === 'adequate' || gap.currentStatus === 'optimal';
                                return (
                                    <div key={gap.nutrient}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium text-white">{gap.nutrient}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isGood ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{gap.currentStatus}</span>
                                                <span className={`text-xs font-bold ${isGood ? 'text-green-400' : 'text-amber-400'}`}>{gap.fulfillmentPercent}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                            <div className={`h-2 rounded-full transition-all duration-700 ${gap.fulfillmentPercent >= 60 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : gap.fulfillmentPercent >= 30 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`} style={{ width: `${gap.fulfillmentPercent}%` }} />
                                        </div>
                                        <p className="text-[10px] text-gray-600 mt-1">{gap.recommendation}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tips && tips.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                            <Sparkles size={20} className="text-amber-400" /> Today&apos;s AI Health Tips
                        </h3>
                        <div className="space-y-3">
                            {tips.map((tip: any, i: number) => (
                                <div key={i} className="glass-light rounded-xl p-4 hover:border-primary-500/10 border border-transparent transition-all group">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{tip.icon}</span>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-semibold text-white">{tip.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{tip.description}</p>
                                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 capitalize">{tip.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {hs?.improvements && hs.improvements.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400" /> AI Improvement Suggestions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hs.improvements.map((imp: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 glass-light rounded-xl p-4 hover:border-white/10 border border-transparent transition-all">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-400 font-bold text-xs">{i + 1}</span>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{imp}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pi?.spendingTrend && pi.spendingTrend.length > 0 && (() => {
                const maxAmount = Math.max(...pi.spendingTrend.map((s: any) => s.amount), 1);
                return (
                    <div className="glass rounded-2xl p-6 mb-8 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-500/[0.03] to-transparent pointer-events-none" />
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 relative z-10">
                            <TrendingUp size={20} className="text-blue-400" /> Spending Trend (Last 6 Months)
                        </h3>
                        <div className="flex items-end gap-3 h-44 relative z-10">
                            {pi.spendingTrend.map((m: any) => {
                                const h = Math.max((m.amount / maxAmount) * 140, 8);
                                return (
                                    <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1.5 group cursor-default">
                                        <span className="text-[11px] text-gray-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">${m.amount.toFixed(0)}</span>
                                        <div className="group-hover:scale-[1.05] transition-transform duration-300 w-full" style={{ height: `${h}px`, borderRadius: '10px 10px 4px 4px', background: 'linear-gradient(to top, #1d4ed8, #3b82f6 40%, #60a5fa 80%, #93c5fd)', boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)', position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', borderRadius: '10px 10px 0 0' }} />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium">{m.month.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {pi?.insights && pi.insights.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target size={20} className="text-purple-400" /> Purchase Intelligence
                    </h3>
                    <div className="space-y-2">
                        {pi.insights.map((insight: string, i: number) => (
                            <div key={i} className="glass-light rounded-lg px-4 py-3 text-sm text-gray-300">{insight}</div>
                        ))}
                        {pi.nextPurchasePrediction && (
                            <div className="glass-light rounded-lg px-4 py-3 text-sm text-primary-300 border border-primary-500/10 flex items-center gap-2">
                                <Zap size={14} className="text-primary-400 flex-shrink-0" /> {pi.nextPurchasePrediction}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {pi?.reorderSuggestions && pi.reorderSuggestions.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Pill size={20} className="text-green-400" /> Reorder Suggestions</h3>
                    <div className="product-grid">{pi.reorderSuggestions.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
                </section>
            )}

            {hs?.recommendedProducts && hs.recommendedProducts.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><Target size={20} className="text-primary-400" /> Products to Improve Your Score</h3>
                    <p className="text-sm text-gray-500 mb-4">These products align with your health goals and can help improve your health score</p>
                    <div className="product-grid">{hs.recommendedProducts.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
                </section>
            )}

            {ng?.suggestedProducts && ng.suggestedProducts.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2"><Droplets size={20} className="text-cyan-400" /> Cover Your Nutrition Gaps</h3>
                    <p className="text-sm text-gray-500 mb-4">AI-selected products to fill nutritional deficiencies</p>
                    <div className="product-grid">{ng.suggestedProducts.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
                </section>
            )}

            {/* Quick Links */}
            <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2"><Zap size={20} className="text-amber-400" /> AI Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { href: '/ai/chat', icon: <Brain size={22} />, label: 'RAG AI Chat', desc: 'Groq LLM', color: 'from-primary-500/20 to-purple-500/20', textColor: 'text-primary-400' },
                        { href: '/symptom-search', icon: <MessageCircle size={22} />, label: 'Symptom Checker', desc: 'AI analysis', color: 'from-green-500/20 to-emerald-500/20', textColor: 'text-green-400' },
                        { href: '/ai/interactions', icon: <Heart size={22} />, label: 'Interactions', desc: 'Drug checker', color: 'from-red-500/20 to-pink-500/20', textColor: 'text-red-400' },
                        { href: '/ai/compare', icon: <GitCompare size={22} />, label: 'Smart Compare', desc: 'AI analysis', color: 'from-amber-500/20 to-yellow-500/20', textColor: 'text-amber-400' },
                        { href: '/recommendations', icon: <Sparkles size={22} />, label: 'Recommendations', desc: 'Personalized', color: 'from-cyan-500/20 to-blue-500/20', textColor: 'text-cyan-400' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} className="glass-light rounded-xl p-4 text-center hover-card group border border-transparent hover:border-white/10">
                            <div className={`w-11 h-11 mx-auto mb-2 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform ${item.textColor}`}>{item.icon}</div>
                            <span className="text-xs font-medium text-white block">{item.label}</span>
                            <span className="text-[10px] text-gray-500">{item.desc}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
