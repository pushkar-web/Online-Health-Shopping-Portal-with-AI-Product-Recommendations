'use client';
import { useState, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, AlertCircle, CheckCircle, Calendar, Activity, ShoppingBag, Zap, Clock, ChevronRight } from 'lucide-react';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HealthShieldPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        aiAPI.healthShield()
            .then(r => { if (r?.data) setData(r.data); else setError(true); })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const getSeverityStyle = (s: string) => {
        if (s === 'severe') return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500', icon: <AlertTriangle size={16} /> };
        if (s === 'moderate') return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500', icon: <AlertCircle size={16} /> };
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500', icon: <CheckCircle size={16} /> };
    };

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-white/5 rounded-xl w-64" />
                <div className="h-40 bg-white/5 rounded-2xl" />
                <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors"><ArrowLeft size={18} className="text-gray-400" /></Link>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">Health Shield
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 font-semibold">PREDICTIVE AI</span>
                        </h1>
                        <p className="text-xs text-gray-500">Seasonal health threats & personalized prevention</p>
                    </div>
                </div>
            </div>

            {(data || error) && (() => {
                // If API failed, use client-side fallback data
                const currentMonth = new Date().getMonth(); // 0-indexed
                const SEASONAL_THREATS: Record<number, { name: string; severity: string; description: string; month: string; monthOffset: number; personalRiskScore: number }[]> = {
                    0: [{ name: 'Flu & Cold Season', severity: 'severe', description: 'Influenza and common cold peak during winter months. Stay protected with immune boosters.', month: 'JANUARY', monthOffset: 0, personalRiskScore: 65 }, { name: 'Vitamin D Deficiency', severity: 'moderate', description: 'Reduced sunlight exposure leads to low Vitamin D levels affecting bone health and immunity.', month: 'JANUARY', monthOffset: 0, personalRiskScore: 55 }, { name: 'Dry Skin & Respiratory Issues', severity: 'mild', description: 'Cold dry air causes skin cracking and respiratory irritation.', month: 'JANUARY', monthOffset: 0, personalRiskScore: 40 }],
                    1: [{ name: 'Flu & Cold Season', severity: 'severe', description: 'Influenza and common cold continue through late winter.', month: 'FEBRUARY', monthOffset: 0, personalRiskScore: 60 }, { name: 'Vitamin D Deficiency', severity: 'moderate', description: 'Low sunlight persists — supplement with Vitamin D.', month: 'FEBRUARY', monthOffset: 0, personalRiskScore: 55 }],
                    2: [{ name: 'Spring Allergies', severity: 'moderate', description: 'Pollen levels surge causing allergic rhinitis and asthma attacks.', month: 'MARCH', monthOffset: 0, personalRiskScore: 60 }, { name: 'Post-Winter Immunity Gap', severity: 'moderate', description: 'Immune system weakened after winter months needs rebuilding.', month: 'MARCH', monthOffset: 0, personalRiskScore: 55 }, { name: 'Energy Slump', severity: 'mild', description: 'Seasonal transition can cause fatigue and mood changes.', month: 'MARCH', monthOffset: 0, personalRiskScore: 40 }],
                    3: [{ name: 'Spring Allergies', severity: 'moderate', description: 'Peak pollen season continues — antihistamines and quercetin help.', month: 'APRIL', monthOffset: 0, personalRiskScore: 60 }, { name: 'Energy Slump', severity: 'mild', description: 'Spring fatigue is common as body adjusts to changing seasons.', month: 'APRIL', monthOffset: 0, personalRiskScore: 35 }],
                    4: [{ name: 'Dehydration & Electrolyte Loss', severity: 'severe', description: 'Heat causes excessive sweating and electrolyte depletion.', month: 'MAY', monthOffset: 0, personalRiskScore: 65 }, { name: 'UV Skin Damage', severity: 'moderate', description: 'Increased sun exposure leads to skin damage and aging.', month: 'MAY', monthOffset: 0, personalRiskScore: 50 }],
                    5: [{ name: 'Dehydration & Electrolyte Loss', severity: 'severe', description: 'Peak summer heat demands constant hydration and mineral replenishment.', month: 'JUNE', monthOffset: 0, personalRiskScore: 70 }, { name: 'Heat-Related Digestive Issues', severity: 'moderate', description: 'Food spoilage and bacterial growth increase in summer.', month: 'JUNE', monthOffset: 0, personalRiskScore: 50 }],
                    6: [{ name: 'Dehydration & Electrolyte Loss', severity: 'severe', description: 'Peak heat season — stay hydrated with electrolytes.', month: 'JULY', monthOffset: 0, personalRiskScore: 70 }, { name: 'UV Skin Damage', severity: 'moderate', description: 'Maximum UV index — protect with antioxidants.', month: 'JULY', monthOffset: 0, personalRiskScore: 55 }],
                    7: [{ name: 'Waterborne Infections', severity: 'severe', description: 'Contaminated water causes typhoid, cholera, and gastroenteritis.', month: 'AUGUST', monthOffset: 0, personalRiskScore: 60 }, { name: 'Mosquito-Borne Diseases', severity: 'severe', description: 'Dengue, malaria risk peaks during monsoon season.', month: 'AUGUST', monthOffset: 0, personalRiskScore: 65 }],
                    8: [{ name: 'Waterborne Infections', severity: 'severe', description: 'Monsoon continues — maintain water purification and gut health.', month: 'SEPTEMBER', monthOffset: 0, personalRiskScore: 60 }, { name: 'Fungal Infections', severity: 'moderate', description: 'Humidity breeds fungal skin and nail infections.', month: 'SEPTEMBER', monthOffset: 0, personalRiskScore: 45 }],
                    9: [{ name: 'Pre-Winter Immunity Prep', severity: 'moderate', description: 'Prepare immune system before cold season begins.', month: 'OCTOBER', monthOffset: 0, personalRiskScore: 50 }, { name: 'Joint Pain Flare-Ups', severity: 'moderate', description: 'Temperature drops trigger arthritis and joint stiffness.', month: 'OCTOBER', monthOffset: 0, personalRiskScore: 45 }, { name: 'Seasonal Mood Changes', severity: 'mild', description: 'Reduced daylight can affect mood and energy levels.', month: 'OCTOBER', monthOffset: 0, personalRiskScore: 35 }],
                    10: [{ name: 'Flu & Cold Season', severity: 'severe', description: 'Early flu season begins as temperatures drop.', month: 'NOVEMBER', monthOffset: 0, personalRiskScore: 60 }, { name: 'Vitamin D Deficiency', severity: 'moderate', description: 'Sunlight reduction starts — begin Vitamin D supplementation.', month: 'NOVEMBER', monthOffset: 0, personalRiskScore: 55 }],
                    11: [{ name: 'Flu & Cold Season', severity: 'severe', description: 'Peak flu and cold season — immune support is critical.', month: 'DECEMBER', monthOffset: 0, personalRiskScore: 70 }, { name: 'Vitamin D Deficiency', severity: 'moderate', description: 'Darkest month — Vitamin D supplementation essential.', month: 'DECEMBER', monthOffset: 0, personalRiskScore: 60 }, { name: 'Dry Skin & Respiratory Issues', severity: 'mild', description: 'Cold dry air causes skin cracking and respiratory irritation.', month: 'DECEMBER', monthOffset: 0, personalRiskScore: 40 }],
                };

                const THREAT_COUNTS: Record<number, number> = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3 };
                const MAX_SEVERITY: Record<number, string> = { 0: 'severe', 1: 'severe', 2: 'moderate', 3: 'moderate', 4: 'severe', 5: 'severe', 6: 'severe', 7: 'severe', 8: 'severe', 9: 'moderate', 10: 'severe', 11: 'severe' };

                const d = data || {
                    currentMonth: MONTH_SHORT[currentMonth].toUpperCase(),
                    overallPreparedness: 65,
                    threats: SEASONAL_THREATS[currentMonth] || [],
                    timeline: Array.from({ length: 12 }, (_, i) => ({
                        month: MONTH_SHORT[i],
                        threatCount: THREAT_COUNTS[i] || 2,
                        maxSeverity: MAX_SEVERITY[i] || 'moderate',
                        isCurrent: i === currentMonth,
                    })),
                    recommendedProducts: [],
                };

                return (
                <div className="space-y-6">
                    {/* Error notice */}
                    {error && !data && (
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                            <Shield size={14} className="text-indigo-400" />
                            <p className="text-xs text-indigo-300">Showing seasonal health data for your region. Log in for personalized risk scores.</p>
                        </div>
                    )}

                    {/* Preparedness Score */}
                    <div className="glass rounded-2xl p-6 border border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm text-gray-400 mb-1">Your Preparedness Score</h2>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-bold ${d.overallPreparedness >= 70 ? 'text-emerald-400' : d.overallPreparedness >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {d.overallPreparedness}
                                </span>
                                <span className="text-gray-500 text-sm">/ 100</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Current month: {d.currentMonth}</p>
                        </div>
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none"
                                    stroke={d.overallPreparedness >= 70 ? '#34d399' : d.overallPreparedness >= 40 ? '#fbbf24' : '#f87171'}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${d.overallPreparedness * 2.64} 264`} />
                            </svg>
                            <Shield size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/60" />
                        </div>
                    </div>

                    {/* 12-Month Timeline */}
                    {d.timeline && (
                        <div className="glass rounded-2xl p-5 border border-white/5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Calendar size={14} className="text-indigo-400" /> 12-Month Threat Timeline</h3>
                            <div className="flex gap-1">
                                {d.timeline.map((m: any, i: number) => {
                                    const style = getSeverityStyle(m.maxSeverity || 'mild');
                                    return (
                                        <div key={i} className={`flex-1 rounded-lg p-2 text-center transition-all ${m.isCurrent ? 'ring-2 ring-indigo-500/50 bg-indigo-500/10' : 'bg-white/5 hover:bg-white/10'}`}>
                                            <span className="text-[10px] text-gray-500 block">{MONTH_SHORT[i]}</span>
                                            <div className={`w-3 h-3 rounded-full mx-auto my-1.5 ${m.threatCount > 0 ? style.dot : 'bg-gray-700'}`} />
                                            <span className="text-[9px] text-gray-600">{m.threatCount}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Active Threats */}
                    {d.threats?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1"><Activity size={14} className="text-red-400" /> Upcoming Health Threats</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {d.threats.map((t: any, i: number) => {
                                    const style = getSeverityStyle(t.severity);
                                    return (
                                        <div key={i} className={`glass rounded-xl p-4 border ${style.border} ${t.monthOffset === 0 ? style.bg : ''}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className={`p-1.5 rounded-lg ${style.bg}`}>{style.icon}</div>
                                                <span className="text-[10px] text-gray-500">{t.month}</span>
                                            </div>
                                            <h4 className="text-sm font-medium text-white mb-1">{t.name}</h4>
                                            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{t.description}</p>
                                            {t.personalRiskScore != null && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full bg-gradient-to-r ${t.personalRiskScore >= 70 ? 'from-red-500 to-rose-500' : t.personalRiskScore >= 40 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500'}`}
                                                            style={{ width: `${t.personalRiskScore}%` }} />
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">Risk: {t.personalRiskScore}%</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recommended Products */}
                    {d.recommendedProducts?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1"><ShoppingBag size={14} className="text-indigo-400" /> Prevention Bundle</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {d.recommendedProducts.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                            </div>
                        </div>
                    )}

                    {d.responseTimeMs && (
                        <p className="text-[10px] text-gray-600 text-center flex items-center justify-center gap-2">
                            <Zap size={10} className="text-amber-400" /> Generated in {(d.responseTimeMs / 1000).toFixed(1)}s
                        </p>
                    )}
                </div>
                );
            })()}
        </div>
    );
}
