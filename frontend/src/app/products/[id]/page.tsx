'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { productAPI, reviewAPI, recommendAPI, aiAPI } from '@/lib/api';
import { useCartStore, useAuthStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import ReviewForm from '@/components/ReviewForm';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
    const [adding, setAdding] = useState(false);
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

    const handleAddToCart = async () => {
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        setAdding(true);
        try {
            await addToCart(product.id, qty);
            toast.success('Added to cart');
        } catch { toast.error('Failed to add'); }
        setAdding(false);
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 rounded-lg shimmer" />
                <div className="space-y-4">
                    <div className="h-8 w-3/4 shimmer rounded" />
                    <div className="h-4 w-1/2 shimmer rounded" />
                    <div className="h-24 shimmer rounded" />
                </div>
            </div>
        </div>
    );

    if (!product) return <div className="text-center py-20 text-onSurfaceVar">Product not found</div>;

    const p = product;
    const discount = p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-outline">
                <Link href="/" className="hover:text-onSurfaceVar transition-colors">Home</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-onSurfaceVar transition-colors">Products</Link>
                <span>/</span>
                <span className="text-onSurfaceVar truncate max-w-[200px]">{p.name}</span>
            </nav>

            {/* Product Main */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                {/* Image */}
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-8 flex items-center justify-center h-96 relative overflow-hidden group">
                    {p.imageUrl && p.imageUrl.startsWith('http') && !imgError ? (
                        <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <svg className="w-24 h-24 text-sage/15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                            <span className="text-sm text-outline">Product Image</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {p.featured && <span className="vc-badge vc-badge-amber">Featured</span>}
                        {discount > 0 && <span className="vc-badge vc-badge-sage text-sm font-bold">−{discount}%</span>}
                    </div>
                </div>

                {/* Info */}
                <div>
                    {p.brand && <span className="text-xs text-outline uppercase tracking-wider mb-2 block">{p.brand}</span>}
                    <h1 className="text-3xl font-bold text-onSurface mb-4 tracking-tight">{p.name}</h1>

                    {p.averageRating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-sm ${i < Math.round(p.averageRating) ? 'text-amber' : 'text-vc-surface-bright'}`}>★</span>
                                ))}
                            </div>
                            <span className="text-sm text-outline">{p.averageRating.toFixed(1)} ({p.reviewCount} reviews)</span>
                        </div>
                    )}

                    <p className="text-onSurfaceVar text-sm leading-relaxed mb-6">{p.description}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-bold text-onSurface">${(p.discountPrice || p.price).toFixed(2)}</span>
                        {p.discountPrice && <span className="text-lg text-outline line-through">${p.price.toFixed(2)}</span>}
                        {discount > 0 && <span className="vc-badge vc-badge-sage">Save {discount}%</span>}
                    </div>

                    {/* Tags */}
                    {p.healthGoals && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {(Array.isArray(p.healthGoals) ? p.healthGoals : p.healthGoals.split(',')).map((g: string) => (
                                <span key={g} className="vc-badge vc-badge-sage">{g.trim()}</span>
                            ))}
                        </div>
                    )}
                    {p.dietaryInfo && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {(Array.isArray(p.dietaryInfo) ? p.dietaryInfo : p.dietaryInfo.split(',')).map((d: string) => (
                                <span key={d} className="vc-badge vc-badge-stone">{d.trim()}</span>
                            ))}
                        </div>
                    )}

                    {/* Add to cart */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center bg-vc-surface rounded-md border border-outlineVar/15">
                            <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 text-outline hover:text-onSurface transition-colors">−</button>
                            <span className="px-4 py-2.5 text-onSurface font-medium min-w-[2.5rem] text-center border-x border-outlineVar/15">{qty}</span>
                            <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 text-outline hover:text-onSurface transition-colors">+</button>
                        </div>
                        <button onClick={handleAddToCart} disabled={adding}
                            className="btn-sage flex-1 py-3 text-center text-base disabled:opacity-50">
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>

                    {p.stock > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-sage" />
                            <span className="text-sage">In Stock</span>
                            <span className="text-outline">({p.stock} available)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-vcError" />
                            <span className="text-vcError">Out of Stock</span>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Dosage Info */}
            {dosage && (
                <div className="bg-vc-surface-high rounded-lg border border-sage/10 p-5 mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sage/3 to-transparent" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <h3 className="text-sm font-semibold text-onSurface">AI Dosage Recommendation</h3>
                            <span className="vc-badge vc-badge-sage ml-auto">AI Powered</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-vc-surface rounded-md p-3">
                                <p className="text-[10px] text-outline mb-1 uppercase tracking-wider">Dosage</p>
                                <p className="text-sm text-onSurface font-medium">{dosage.recommendedDosage || 'Follow label'}</p>
                            </div>
                            <div className="bg-vc-surface rounded-md p-3">
                                <p className="text-[10px] text-outline mb-1 uppercase tracking-wider">Best Time</p>
                                <p className="text-sm text-onSurface font-medium">{dosage.timing || 'Any time'}</p>
                            </div>
                            <div className="bg-vc-surface rounded-md p-3">
                                <p className="text-[10px] text-outline mb-1 uppercase tracking-wider">Frequency</p>
                                <p className="text-sm text-onSurface font-medium">{dosage.frequency || 'Daily'}</p>
                            </div>
                            <div className="bg-vc-surface rounded-md p-3">
                                <p className="text-[10px] text-outline mb-1 uppercase tracking-wider">Tips</p>
                                <p className="text-sm text-onSurface font-medium">{dosage.tips?.[0] || 'Follow label instructions'}</p>
                            </div>
                        </div>
                        {dosage.warnings?.length > 0 && (
                            <div className="mt-3 flex items-start gap-2 text-amber text-xs p-2 bg-amber/5 rounded-md">
                                <span>⚠️</span>
                                <p>{dosage.warnings[0]}</p>
                            </div>
                        )}
                        {dosage.personalizedNotes?.length > 0 && (
                            <div className="mt-2 flex items-start gap-2 text-sage text-xs p-2 bg-sage/5 rounded-md">
                                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                <p>{dosage.personalizedNotes[0]}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-8">
                <Link href="/ai/interactions"
                    className="btn-ghost text-sm flex items-center gap-2 hover:border-amber/30">
                    <svg className="w-4 h-4 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    Check Interactions
                </Link>
                <Link href="/ai/compare"
                    className="btn-ghost text-sm flex items-center gap-2 hover:border-sage/30">
                    <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                    Compare with AI
                </Link>
                <Link href="/symptom-search"
                    className="btn-ghost text-sm flex items-center gap-2 hover:border-stone/30">
                    <svg className="w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Ask AI About This
                </Link>
            </div>

            {/* Tabs */}
            <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 overflow-hidden mb-12">
                <div className="flex border-b border-outlineVar/15">
                    {(['details', 'reviews'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-sage border-b-2 border-sage' : 'text-outline hover:text-onSurfaceVar'}`}>
                            {t === 'reviews' ? `Reviews (${reviews.length})` : 'Product Details'}
                        </button>
                    ))}
                </div>
                <div className="p-6">
                    {tab === 'details' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {p.ingredients && <div><h4 className="font-semibold text-onSurface mb-2">Ingredients</h4><p className="text-onSurfaceVar leading-relaxed">{p.ingredients}</p></div>}
                            {p.benefits && <div><h4 className="font-semibold text-onSurface mb-2">Benefits</h4><p className="text-onSurfaceVar leading-relaxed">{p.benefits}</p></div>}
                            {p.dosage && <div><h4 className="font-semibold text-onSurface mb-2">Dosage</h4><p className="text-onSurfaceVar leading-relaxed">{p.dosage}</p></div>}
                            {p.allergenInfo && <div><h4 className="font-semibold text-onSurface mb-2">Allergen Info</h4><p className="text-amber">{p.allergenInfo}</p></div>}
                            {p.suitableAgeGroups && <div><h4 className="font-semibold text-onSurface mb-2">Suitable For</h4><p className="text-onSurfaceVar">{p.suitableAgeGroups}</p></div>}
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
                                <div className="bg-vc-surface rounded-lg border border-outlineVar/15 p-6 text-center">
                                    <p className="text-onSurfaceVar text-sm mb-4">Please sign in to write a review</p>
                                    <button onClick={() => window.location.href = '/login'} className="btn-outline-sage px-6 py-2">Sign In</button>
                                </div>
                            )}

                            <div className="space-y-3">
                                {reviews.length === 0 ? (
                                    <p className="text-outline text-center py-8 text-sm">No reviews yet. Be the first!</p>
                                ) : reviews.map((r: any, i: number) => (
                                    <div key={i} className="bg-vc-surface rounded-lg border border-outlineVar/15 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, si) => (
                                                    <span key={si} className={`text-xs ${si < r.rating ? 'text-amber' : 'text-vc-surface-bright'}`}>★</span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-outline">{r.userName}</span>
                                            <span className="text-xs text-outline ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-onSurfaceVar">{r.comment}</p>
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
                    <div className="mb-6">
                        <span className="text-xs text-sage font-medium uppercase tracking-widest mb-1 block">AI Suggestion</span>
                        <h2 className="text-2xl font-bold text-onSurface">Frequently Bought Together</h2>
                    </div>
                    <div className="product-grid">
                        {fbt.slice(0, 4).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
