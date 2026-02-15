'use client';
import { useState, useEffect } from 'react';
import { aiAPI, productAPI } from '@/lib/api';

export default function ProductComparePage() {
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productSearch.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(() => {
            productAPI.getAll({ search: productSearch, size: 8 })
                .then(r => setSearchResults(r.data.content || r.data || []))
                .catch(() => {});
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const addProduct = (product: any) => {
        if (selectedProducts.length >= 4 || selectedProducts.find(p => p.id === product.id)) return;
        setSelectedProducts(prev => [...prev, product]);
        setProductSearch('');
        setSearchResults([]);
    };

    const removeProduct = (id: number) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
        setResult(null);
    };

    const compareProducts = async () => {
        if (selectedProducts.length < 2) return;
        setLoading(true);
        try {
            const res = await aiAPI.compareProducts(selectedProducts.map(p => p.id));
            setResult(res.data);
        } catch { }
        setLoading(false);
    };

    const scoreColorsMap: Record<string, string> = {
        'Excellent': 'text-green-400',
        'Very Good': 'text-emerald-400',
        'Good': 'text-blue-400',
        'Average': 'text-yellow-400',
        'Below Average': 'text-red-400',
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-10">
                <span className="text-5xl block mb-4">⚖️</span>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">AI Smart Compare</h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Compare 2-4 products side-by-side with AI-powered scoring across 6 dimensions
                </p>
            </div>

            {/* Product Selection */}
            <div className="glass rounded-2xl p-6 mb-8">
                <label className="text-sm font-semibold text-white mb-2 block">Search & Select Products (2-4)</label>
                <div className="relative mb-4">
                    <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                        placeholder="Search products to compare..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" />
                    {searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 glass-strong rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto">
                            {searchResults.map((p: any) => (
                                <button key={p.id} onClick={() => addProduct(p)}
                                    disabled={selectedProducts.find(sp => sp.id === p.id)}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 disabled:opacity-30">
                                    <span className="text-lg">💊</span>
                                    <div className="flex-1">
                                        <div className="text-sm text-white">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.brand} • ${(p.discountPrice || p.price)?.toFixed(2)}</div>
                                    </div>
                                    {p.averageRating > 0 && <span className="text-xs text-yellow-400">⭐ {p.averageRating.toFixed(1)}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {selectedProducts.map(p => (
                        <div key={p.id} className="glass-light rounded-xl p-3 relative group">
                            <button onClick={() => removeProduct(p.id)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                            <div className="text-center">
                                <span className="text-3xl block mb-1">💊</span>
                                <div className="text-xs font-medium text-white truncate">{p.name}</div>
                                <div className="text-[10px] text-gray-500">${(p.discountPrice || p.price)?.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                    {selectedProducts.length < 4 && (
                        <div className="glass-light rounded-xl p-3 border-2 border-dashed border-white/10 flex items-center justify-center text-gray-600 text-xs">
                            + Add Product
                        </div>
                    )}
                </div>

                <button onClick={compareProducts}
                    disabled={loading || selectedProducts.length < 2}
                    className="btn-accent w-full py-3 text-lg rounded-xl disabled:opacity-50">
                    {loading ? '🔄 Comparing...' : `⚖️ Compare ${selectedProducts.length} Products`}
                </button>
            </div>

            {/* Comparison Results */}
            {result && !loading && (
                <div className="animate-fade-in space-y-6">
                    {/* AI Recommendation Banner */}
                    {result.aiRecommendedId && (
                        <div className="glass rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-health-600/10" />
                            <div className="relative flex items-center gap-4">
                                <span className="text-4xl">🏆</span>
                                <div>
                                    <h3 className="text-lg font-bold text-white">AI Recommends: {result.products?.find((p: any) => p.id === result.aiRecommendedId)?.name}</h3>
                                    <p className="text-sm text-gray-400">{result.aiRecommendationReason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comparison Table */}
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium w-44">Dimension</th>
                                        {result.products?.map((p: any) => (
                                            <th key={p.id} className="px-4 py-3 text-center">
                                                <div className="text-sm font-semibold text-white">{p.name}</div>
                                                <div className="text-[10px] text-gray-500">{p.brand}</div>
                                                {p.id === result.aiRecommendedId && (
                                                    <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">🏆 AI Pick</span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Basic Info Rows */}
                                    <tr className="border-b border-white/5">
                                        <td className="px-4 py-3 text-xs text-gray-400">Price</td>
                                        {result.products?.map((p: any) => (
                                            <td key={p.id} className="px-4 py-3 text-center">
                                                <span className="text-sm font-bold text-white">${(p.discountPrice || p.price)?.toFixed(2)}</span>
                                                {p.discountPrice && <span className="text-xs text-gray-500 line-through ml-1">${p.price?.toFixed(2)}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="px-4 py-3 text-xs text-gray-400">Rating</td>
                                        {result.products?.map((p: any) => (
                                            <td key={p.id} className="px-4 py-3 text-center">
                                                <span className="text-sm text-yellow-400">⭐ {p.rating?.toFixed(1) || 'N/A'}</span>
                                                <span className="text-xs text-gray-600 block">({p.reviewCount || 0} reviews)</span>
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="px-4 py-3 text-xs text-gray-400">Dosage</td>
                                        {result.products?.map((p: any) => (
                                            <td key={p.id} className="px-4 py-3 text-center text-xs text-gray-300">{p.dosage || '-'}</td>
                                        ))}
                                    </tr>

                                    {/* AI Score Dimensions */}
                                    {result.dimensions?.map((dim: any) => (
                                        <tr key={dim.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="px-4 py-3">
                                                <div className="text-xs font-medium text-white">{dim.name}</div>
                                                <div className="text-[10px] text-gray-600">{dim.description}</div>
                                            </td>
                                            {result.products?.map((p: any) => {
                                                const score = p.scores?.[dim.name] || 'N/A';
                                                const color = scoreColorsMap[score] || 'text-gray-400';
                                                return (
                                                    <td key={p.id} className="px-4 py-3 text-center">
                                                        <span className={`text-sm font-semibold ${color}`}>{score}</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Health Goals */}
                                    <tr className="border-b border-white/5">
                                        <td className="px-4 py-3 text-xs text-gray-400">Health Goals</td>
                                        {result.products?.map((p: any) => (
                                            <td key={p.id} className="px-4 py-3 text-center">
                                                <div className="flex flex-wrap gap-1 justify-center">
                                                    {p.healthGoals?.slice(0, 3).map((g: string) => (
                                                        <span key={g} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">{g.trim()}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-600">
                        AI scores are calculated based on product data, user ratings, ingredients, and health goal coverage
                    </p>
                </div>
            )}
        </div>
    );
}
