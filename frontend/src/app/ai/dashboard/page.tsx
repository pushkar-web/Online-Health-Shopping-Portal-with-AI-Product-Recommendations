'use client';
import { useEffect, useState } from 'react';
import { aiAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function AIHealthDashboardPage() {
    const [insights, setInsights] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user, loadUser } = useAuthStore();

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) { setLoading(false); return; }
        aiAPI.healthInsights()
            .then(r => { setInsights(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🧠</span>
                <h2 className="text-2xl font-bold text-white mb-2">Sign in to Access AI Health Dashboard</h2>
                <p className="text-gray-400 mb-6">Get your personalized health score, nutrition analysis, and AI-powered insights</p>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-8 w-64 shimmer rounded mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-48 shimmer rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-64 shimmer rounded-xl" />)}
                </div>
            </div>
        );
    }

    const hs = insights?.healthScore;
    const pi = insights?.purchaseInsights;
    const ng = insights?.nutritionGaps;
    const tips = insights?.dailyTips;

    const gradeColors: Record<string, string> = {
        'A+': 'from-green-400 to-emerald-400', 'A': 'from-green-400 to-teal-400',
        'B+': 'from-blue-400 to-cyan-400', 'B': 'from-blue-400 to-indigo-400',
        'C': 'from-yellow-400 to-amber-400', 'D': 'from-red-400 to-orange-400',
    };

    const statusColors: Record<string, string> = {
        excellent: 'text-green-400', good: 'text-blue-400',
        fair: 'text-yellow-400', poor: 'text-red-400',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">🧠</span>
                <div>
                    <h1 className="text-3xl font-bold text-white">AI Health Dashboard</h1>
                    <p className="text-gray-400">Your personalized health intelligence, powered by AI</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Health Score Card */}
                {hs && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-health-600/5" />
                        <div className="relative">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">AI HEALTH SCORE</h3>
                            <div className="flex items-center gap-4">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeColors[hs.grade] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                                    <span className="text-3xl font-black text-white">{hs.grade}</span>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">{hs.overallScore}<span className="text-lg text-gray-400">/100</span></div>
                                    <p className="text-xs text-gray-500 mt-1">{hs.summary?.split('.')[0]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Purchase Stats */}
                {pi && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5" />
                        <div className="relative">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">PURCHASE INSIGHTS</h3>
                            <div className="text-3xl font-bold text-white mb-1">{pi.totalOrders} <span className="text-lg text-gray-400">orders</span></div>
                            <div className="text-lg text-gray-300">${pi.totalSpent?.toFixed(2)} <span className="text-sm text-gray-500">total spent</span></div>
                            {pi.topCategory && pi.topCategory !== 'N/A' && (
                                <div className="mt-2 text-xs text-gray-500">Top: {pi.topCategory}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Nutrition Coverage */}
                {ng && (
                    <div className="glass rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5" />
                        <div className="relative">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">NUTRITION COVERAGE</h3>
                            {(() => {
                                const covered = ng.gaps?.filter((g: any) => g.currentStatus === 'adequate' || g.currentStatus === 'optimal').length || 0;
                                const total = ng.gaps?.length || 1;
                                const pct = Math.round((covered / total) * 100);
                                return (
                                    <>
                                        <div className="text-3xl font-bold text-white mb-1">{pct}%</div>
                                        <div className="text-sm text-gray-400">{covered} of {total} key nutrients covered</div>
                                        <div className="mt-2 w-full bg-white/5 rounded-full h-2">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
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
                    <h3 className="text-lg font-semibold text-white mb-4">📊 Health Score Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {hs.dimensions.map((dim: any) => (
                            <div key={dim.name} className="glass-light rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-400">{dim.name}</span>
                                    <span className={`text-xs font-semibold ${statusColors[dim.status] || 'text-gray-400'}`}>{dim.status}</span>
                                </div>
                                <div className="text-2xl font-bold text-white mb-2">{dim.score}</div>
                                <div className="w-full bg-white/5 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${dim.score >= 70 ? 'bg-green-500' : dim.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${dim.score}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-600 mt-2">{dim.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Nutrition Gaps */}
                {ng?.gaps && ng.gaps.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">🧬 Nutrition Gap Analysis</h3>
                        <div className="space-y-3">
                            {ng.gaps.map((gap: any) => (
                                <div key={gap.nutrient} className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-white">{gap.nutrient}</span>
                                            <span className={`text-xs font-semibold ${gap.currentStatus === 'adequate' || gap.currentStatus === 'optimal' ? 'text-green-400' : 'text-amber-400'}`}>
                                                {gap.fulfillmentPercent}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${gap.fulfillmentPercent >= 60 ? 'bg-green-500' : gap.fulfillmentPercent >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${gap.fulfillmentPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-600 mt-0.5">{gap.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Daily Tips */}
                {tips && tips.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">💡 Today&apos;s AI Health Tips</h3>
                        <div className="space-y-3">
                            {tips.map((tip: any, i: number) => (
                                <div key={i} className="glass-light rounded-xl p-4 hover:border-primary-500/20 border border-transparent transition-all">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{tip.icon}</span>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{tip.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1">{tip.description}</p>
                                            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 capitalize">{tip.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Improvements */}
            {hs?.improvements && hs.improvements.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">🚀 AI Improvement Suggestions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hs.improvements.map((imp: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 glass-light rounded-xl p-4">
                                <span className="text-primary-400 font-bold text-lg">{i + 1}</span>
                                <p className="text-sm text-gray-300">{imp}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Spending Trend */}
            {pi?.spendingTrend && pi.spendingTrend.length > 0 && (() => {
                const maxAmount = Math.max(...pi.spendingTrend.map((s: any) => s.amount), 1);
                return (
                    <div className="glass rounded-2xl p-6 mb-8 relative overflow-hidden">
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(37, 99, 235, 0.04), transparent)', pointerEvents: 'none' }} />
                        <h3 className="text-lg font-semibold text-white mb-4 relative z-10">📈 Spending Trend (Last 6 Months)</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', position: 'relative', zIndex: 10 }}>
                            {pi.spendingTrend.map((m: any) => {
                                const barHeight = Math.max((m.amount / maxAmount) * 125, 8);
                                return (
                                    <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', cursor: 'default' }} className="group">
                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>₹{m.amount.toFixed(0)}</span>
                                        <div className="group-hover:scale-[1.06] transition-transform duration-300" style={{
                                            width: '100%',
                                            height: `${barHeight}px`,
                                            borderRadius: '10px 10px 4px 4px',
                                            background: 'linear-gradient(to top, #1d4ed8, #3b82f6 40%, #60a5fa 80%, #93c5fd)',
                                            boxShadow: '0 0 14px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
                                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                            minHeight: '8px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)', borderRadius: '10px 10px 0 0' }} />
                                        </div>
                                        <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>{m.month.split(' ')[0]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* Purchase Insights */}
            {pi?.insights && pi.insights.length > 0 && (
                <div className="glass rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">🔍 Purchase Intelligence</h3>
                    <div className="space-y-2">
                        {pi.insights.map((insight: string, i: number) => (
                            <div key={i} className="glass-light rounded-lg px-4 py-3 text-sm text-gray-300">{insight}</div>
                        ))}
                        {pi.nextPurchasePrediction && (
                            <div className="glass-light rounded-lg px-4 py-3 text-sm text-primary-300 border border-primary-500/10">{pi.nextPurchasePrediction}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Reorder Suggestions */}
            {pi?.reorderSuggestions && pi.reorderSuggestions.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">🔄 Reorder Suggestions</h3>
                    <div className="product-grid">
                        {pi.reorderSuggestions.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Products to Improve Score */}
            {hs?.recommendedProducts && hs.recommendedProducts.length > 0 && (
                <section className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-2">🎯 Products to Improve Your Score</h3>
                    <p className="text-sm text-gray-500 mb-4">These products align with your health goals and can help improve your health score</p>
                    <div className="product-grid">
                        {hs.recommendedProducts.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Nutrition Gap Products */}
            {ng?.suggestedProducts && ng.suggestedProducts.length > 0 && (
                <section>
                    <h3 className="text-lg font-semibold text-white mb-2">🧬 Cover Your Nutrition Gaps</h3>
                    <p className="text-sm text-gray-500 mb-4">AI-selected products to fill nutritional deficiencies</p>
                    <div className="product-grid">
                        {ng.suggestedProducts.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Quick Links */}
            <div className="mt-12 glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">🔗 More AI Features</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link href="/symptom-search" className="glass-light rounded-xl p-4 text-center hover-card">
                        <span className="text-2xl block mb-1">💬</span>
                        <span className="text-xs text-gray-400">AI Health Chat</span>
                    </Link>
                    <Link href="/ai/interactions" className="glass-light rounded-xl p-4 text-center hover-card">
                        <span className="text-2xl block mb-1">⚕️</span>
                        <span className="text-xs text-gray-400">Interaction Checker</span>
                    </Link>
                    <Link href="/ai/compare" className="glass-light rounded-xl p-4 text-center hover-card">
                        <span className="text-2xl block mb-1">⚖️</span>
                        <span className="text-xs text-gray-400">Smart Compare</span>
                    </Link>
                    <Link href="/recommendations" className="glass-light rounded-xl p-4 text-center hover-card">
                        <span className="text-2xl block mb-1">🎯</span>
                        <span className="text-xs text-gray-400">Recommendations</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
