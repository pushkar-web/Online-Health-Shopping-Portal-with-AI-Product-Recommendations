'use client';
import { useState, useEffect } from 'react';
import { aiAPI, productAPI } from '@/lib/api';

export default function InteractionCheckerPage() {
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [medications, setMedications] = useState<string[]>([]);
    const [medInput, setMedInput] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (!productSearch.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(() => {
            setSearchLoading(true);
            productAPI.getAll({ search: productSearch, size: 6 })
                .then(r => setSearchResults(r.data.content || r.data || []))
                .catch(() => {})
                .finally(() => setSearchLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const addProduct = (product: any) => {
        if (selectedProducts.length >= 6 || selectedProducts.find(p => p.id === product.id)) return;
        setSelectedProducts(prev => [...prev, product]);
        setProductSearch('');
        setSearchResults([]);
    };

    const removeProduct = (id: number) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
    };

    const addMedication = () => {
        if (!medInput.trim() || medications.length >= 10) return;
        setMedications(prev => [...prev, medInput.trim()]);
        setMedInput('');
    };

    const removeMedication = (index: number) => {
        setMedications(prev => prev.filter((_, i) => i !== index));
    };

    const checkInteractions = async () => {
        if (selectedProducts.length < 1) return;
        setLoading(true);
        try {
            const res = await aiAPI.checkInteractions(
                selectedProducts.map(p => p.id),
                medications
            );
            setResult(res.data);
        } catch { }
        setLoading(false);
    };

    const severityColors: Record<string, { bg: string; text: string; border: string }> = {
        critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
        moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
        mild: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    };

    const riskColors: Record<string, string> = {
        none: 'text-green-400', low: 'text-yellow-400', moderate: 'text-amber-400', high: 'text-red-400',
    };

    const riskIcons: Record<string, string> = {
        none: '✅', low: '⚡', moderate: '⚠️', high: '🚨',
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <span className="text-5xl block mb-4">⚕️</span>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">AI Interaction Checker</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Check for potential interactions between supplements and medications before you buy. Powered by our AI safety engine.
                </p>
            </div>

            {/* Input Section */}
            <div className="glass rounded-2xl p-6 mb-8">
                {/* Product Search */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-white mb-2 block">🛍️ Select Products / Supplements</label>
                    <div className="relative">
                        <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                            placeholder="Search products to add..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" />
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 glass-strong rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                                {searchResults.map((p: any) => (
                                    <button key={p.id} onClick={() => addProduct(p)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                                        <span className="text-lg">💊</span>
                                        <div>
                                            <div className="text-sm text-white">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.brand || 'Health Supplement'}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {selectedProducts.map(p => (
                                <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-light text-sm text-white">
                                    💊 {p.name}
                                    <button onClick={() => removeProduct(p.id)} className="text-gray-500 hover:text-red-400 ml-1">✕</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Medications Input */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-white mb-2 block">💉 Current Medications (optional)</label>
                    <div className="flex gap-2">
                        <input type="text" value={medInput} onChange={e => setMedInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addMedication()}
                            placeholder="e.g., Warfarin, Lisinopril, Metformin..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" />
                        <button onClick={addMedication} className="btn-outline px-4 py-3 rounded-xl">+ Add</button>
                    </div>

                    {medications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {medications.map((med, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-light text-sm text-amber-300">
                                    💉 {med}
                                    <button onClick={() => removeMedication(i)} className="text-gray-500 hover:text-red-400 ml-1">✕</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Check Button */}
                <button onClick={checkInteractions}
                    disabled={loading || selectedProducts.length < 1}
                    className="btn-accent w-full py-3 text-lg rounded-xl disabled:opacity-50">
                    {loading ? '🔄 Analyzing...' : '🔬 Check Interactions'}
                </button>
            </div>

            {/* Results */}
            {result && !loading && (
                <div className="animate-fade-in space-y-6">
                    {/* Overall Risk */}
                    <div className="glass rounded-2xl p-6 text-center">
                        <span className="text-4xl block mb-2">{riskIcons[result.overallRisk] || '✅'}</span>
                        <h3 className="text-xl font-bold text-white mb-1">Overall Risk Level</h3>
                        <span className={`text-2xl font-bold uppercase ${riskColors[result.overallRisk] || 'text-gray-400'}`}>
                            {result.overallRisk}
                        </span>
                    </div>

                    {/* Warnings */}
                    {result.warnings && result.warnings.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">⚠️ Interaction Warnings ({result.warnings.length})</h3>
                            <div className="space-y-3">
                                {result.warnings.map((w: any, i: number) => {
                                    const colors = severityColors[w.severity] || severityColors.mild;
                                    return (
                                        <div key={i} className={`rounded-xl p-4 border ${colors.border} ${colors.bg}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${colors.text} bg-black/20`}>
                                                    {w.severity}
                                                </span>
                                                <span className="text-sm text-white">{w.product1} × {w.product2}</span>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-2">{w.description}</p>
                                            <p className="text-xs text-gray-400">💡 {w.recommendation}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Safe Combinations */}
                    {result.safeCombinatons && result.safeCombinatons.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">✅ Beneficial Combinations</h3>
                            <div className="space-y-3">
                                {result.safeCombinatons.map((s: any, i: number) => (
                                    <div key={i} className="rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                                        <div className="text-sm text-white mb-1">{s.product1} + {s.product2}</div>
                                        <p className="text-xs text-green-300">{s.benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* General Advice */}
                    {result.generalAdvice && result.generalAdvice.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">📋 General Advice</h3>
                            <div className="space-y-2">
                                {result.generalAdvice.map((tip: string, i: number) => (
                                    <div key={i} className="glass-light rounded-lg px-4 py-3 text-sm text-gray-300">{tip}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-600 mt-6">
                        ⚠️ This tool provides general information only and is not a substitute for professional medical advice.
                        Always consult your healthcare provider before starting or changing any supplement regimen.
                    </p>
                </div>
            )}
        </div>
    );
}
