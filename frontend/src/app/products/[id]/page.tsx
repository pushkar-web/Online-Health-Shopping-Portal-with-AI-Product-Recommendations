'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productAPI, reviewAPI, recommendAPI, aiAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/ReviewForm';
import Link from 'next/link';

export default function ProductDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const [product, setProduct] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [fbt, setFbt] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [imgError, setImgError] = useState(false);
    const [tab, setTab] = useState<'details' | 'reviews'>('details');
    const [dosage, setDosage] = useState<any>(null);
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!id) return;
        Promise.all([
            productAPI.getById(id),
            reviewAPI.getByProduct(id).catch(() => ({ data: { content: [] } })),
            recommendAPI.fbt(id).catch(() => ({ data: [] })),
            aiAPI.getDosage(id).catch(() => null),
        ]).then(([p, r, f, d]) => {
            setProduct(p.data);
            setReviews(r.data.content || r.data || []);
            setFbt(f.data || []);
            if (d?.data) setDosage(d.data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 rounded-2xl shimmer" />
                <div className="space-y-4">
                    <div className="h-8 w-3/4 shimmer rounded" />
                    <div className="h-4 w-1/2 shimmer rounded" />
                    <div className="h-24 shimmer rounded" />
                </div>
            </div>
        </div>
    );

    if (!product) return <div className="text-center py-20 text-gray-400">Product not found</div>;

    const p = product;
    const discount = p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Product Main */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Image */}
                <div className="glass-light rounded-2xl p-8 flex items-center justify-center h-96 relative overflow-hidden">
                    {p.imageUrl && p.imageUrl.startsWith('http') && !imgError ? (
                        <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-xl"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-8xl">💊</span>
                    )}
                    {p.featured && <span className="absolute top-4 left-4 badge badge-amber">⭐ Featured</span>}
                    {discount > 0 && <span className="absolute top-4 right-4 badge badge-green text-lg">-{discount}%</span>}
                </div>

                {/* Info */}
                <div>
                    {p.brand && <span className="text-sm text-gray-500 mb-1 block">{p.brand}</span>}
                    <h1 className="text-3xl font-bold text-white mb-3">{p.name}</h1>

                    {p.averageRating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-yellow-400">{'⭐'.repeat(Math.round(p.averageRating))}</span>
                            <span className="text-sm text-gray-400">{p.averageRating.toFixed(1)} ({p.reviewCount} reviews)</span>
                        </div>
                    )}

                    <p className="text-gray-400 mb-6">{p.description}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-bold text-white">${(p.discountPrice || p.price).toFixed(2)}</span>
                        {p.discountPrice && <span className="text-lg text-gray-500 line-through">${p.price.toFixed(2)}</span>}
                    </div>

                    {/* Tags */}
                    {p.healthGoals && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(Array.isArray(p.healthGoals) ? p.healthGoals : p.healthGoals.split(',')).map((g: string) => (
                                <span key={g} className="badge badge-blue">{g.trim()}</span>
                            ))}
                        </div>
                    )}
                    {p.dietaryInfo && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {(Array.isArray(p.dietaryInfo) ? p.dietaryInfo : p.dietaryInfo.split(',')).map((d: string) => (
                                <span key={d} className="badge badge-green">{d.trim()}</span>
                            ))}
                        </div>
                    )}

                    {/* Add to cart */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center glass-light rounded-lg">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-400 hover:text-white">−</button>
                            <span className="px-4 py-2 text-white font-medium">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-gray-400 hover:text-white">+</button>
                        </div>
                        <button onClick={() => isAuthenticated ? addToCart(p.id, qty) : window.location.href = '/login'}
                            className="btn-primary flex-1 py-3 text-center text-lg">
                            🛒 Add to Cart
                        </button>
                    </div>

                    {p.stock > 0 ? (
                        <span className="text-green-400 text-sm">✅ In Stock ({p.stock} available)</span>
                    ) : (
                        <span className="text-red-400 text-sm">❌ Out of Stock</span>
                    )}
                </div>
            </div>

            {/* AI Dosage Info */}
            {dosage && (
                <div className="glass rounded-xl p-5 mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-health-600/5 to-primary-600/5" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">💊</span>
                            <h3 className="text-sm font-semibold text-white">AI Dosage Recommendation</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 ml-auto">AI Powered</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="glass-light rounded-lg p-3">
                                <p className="text-[10px] text-gray-500 mb-1">Recommended Dosage</p>
                                <p className="text-sm text-white font-medium">{dosage.recommendedDosage || 'Follow label'}</p>
                            </div>
                            <div className="glass-light rounded-lg p-3">
                                <p className="text-[10px] text-gray-500 mb-1">Best Time</p>
                                <p className="text-sm text-white font-medium">{dosage.timing || 'Any time'}</p>
                            </div>
                            <div className="glass-light rounded-lg p-3">
                                <p className="text-[10px] text-gray-500 mb-1">Frequency</p>
                                <p className="text-sm text-white font-medium">{dosage.frequency || 'Daily'}</p>
                            </div>
                            <div className="glass-light rounded-lg p-3">
                                <p className="text-[10px] text-gray-500 mb-1">Tips</p>
                                <p className="text-sm text-white font-medium">{dosage.tips?.[0] || 'Follow label instructions'}</p>
                            </div>
                        </div>
                        {dosage.warnings?.length > 0 && (
                            <div className="mt-3 flex items-start gap-2 text-amber-400">
                                <span className="text-xs">⚠️</span>
                                <p className="text-xs">{dosage.warnings[0]}</p>
                            </div>
                        )}
                        {dosage.personalizedNotes?.length > 0 && (
                            <div className="mt-2 flex items-start gap-2 text-primary-400">
                                <span className="text-xs">🤖</span>
                                <p className="text-xs">{dosage.personalizedNotes[0]}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-8">
                <Link href={`/ai/interactions`}
                    className="glass-light rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:border-amber-500/30 border border-transparent transition-all flex items-center gap-2">
                    ⚠️ Check Interactions
                </Link>
                <Link href={`/ai/compare`}
                    className="glass-light rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:border-primary-500/30 border border-transparent transition-all flex items-center gap-2">
                    ⚖️ Compare with AI
                </Link>
                <Link href={`/symptom-search`}
                    className="glass-light rounded-lg px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:border-violet-500/30 border border-transparent transition-all flex items-center gap-2">
                    🩺 Ask AI About This
                </Link>
            </div>

            {/* Tabs */}
            <div className="glass-light rounded-xl overflow-hidden mb-12">
                <div className="flex border-b border-white/5">
                    {(['details', 'reviews'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-500 hover:text-white'}`}>
                            {t === 'reviews' ? `Reviews (${reviews.length})` : 'Product Details'}
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {tab === 'details' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {p.ingredients && <div><h4 className="font-semibold text-white mb-2">Ingredients</h4><p className="text-gray-400">{p.ingredients}</p></div>}
                            {p.benefits && <div><h4 className="font-semibold text-white mb-2">Benefits</h4><p className="text-gray-400">{p.benefits}</p></div>}
                            {p.dosage && <div><h4 className="font-semibold text-white mb-2">Dosage</h4><p className="text-gray-400">{p.dosage}</p></div>}
                            {p.allergenInfo && <div><h4 className="font-semibold text-white mb-2">Allergen Info</h4><p className="text-amber-400">{p.allergenInfo}</p></div>}
                            {p.suitableAgeGroups && <div><h4 className="font-semibold text-white mb-2">Suitable For</h4><p className="text-gray-400">{p.suitableAgeGroups}</p></div>}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {isAuthenticated ? (
                                <ReviewForm
                                    productId={p.id}
                                    onSuccess={() => {
                                        reviewAPI.getByProduct(p.id).then(r => setReviews(r.data.content || r.data || []));
                                    }}
                                />
                            ) : (
                                <div className="glass rounded-xl p-6 text-center">
                                    <p className="text-gray-400 mb-4">Please sign in to write a review</p>
                                    <button onClick={() => window.location.href = '/login'} className="btn-outline px-6 py-2">Sign In</button>
                                </div>
                            )}

                            <div className="space-y-4">
                                {reviews.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                                ) : reviews.map((r: any, i: number) => (
                                    <div key={i} className="glass rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-yellow-400 text-sm">{'⭐'.repeat(r.rating)}</span>
                                            <span className="text-xs text-gray-500">{r.userName}</span>
                                            <span className="text-xs text-gray-600 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-300">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Frequently Bought Together */}
            {fbt.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Frequently Bought Together</h2>
                    <div className="product-grid">
                        {fbt.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
