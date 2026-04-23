'use client';
import Link from 'next/link';
import { useCartStore, useAuthStore, useWishlistStore } from '@/store';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props { product: any; }

export default function ProductCard({ product }: Props) {
    const { addToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [wishLoading, setWishLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const p = product;
    const discount = p.discountPrice ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
    const rating = p.averageRating || 0;
    const hasImage = p.imageUrl && p.imageUrl.startsWith('http') && !imgError;

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        setAdding(true);
        try { await addToCart(p.id, 1); setAdded(true); toast.success(`Added to cart`); setTimeout(() => setAdded(false), 1500); } catch { toast.error('Failed to add'); }
        setAdding(false);
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        setWishLoading(true);
        try {
            if (isInWishlist(p.id)) { await removeFromWishlist(p.id); toast.success('Removed from wishlist'); }
            else { await addToWishlist(p.id); toast.success('Added to wishlist'); }
        } catch { toast.error('Wishlist update failed'); }
        setWishLoading(false);
    };

    const renderStars = () => (
        [...Array(5)].map((_, i) => (
            <span key={i} className={`text-[11px] ${i < Math.round(rating) ? 'text-amber' : 'text-vc-surface-bright'}`}>★</span>
        ))
    );

    return (
        <Link href={`/products/${p.id}`}
            className="block group relative bg-vc-surface-high rounded-lg border border-outlineVar/15 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-vc-hover hover:border-outlineVar/30">
            {/* Image */}
            <div className="relative h-48 bg-vc-surface flex items-center justify-center overflow-hidden">
                {hasImage ? (
                    <img src={p.imageUrl} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage/5 to-stone/5">
                        <svg className="w-16 h-16 text-sage/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {p.featured && <span className="vc-badge vc-badge-amber text-[10px]">Featured</span>}
                    {discount > 0 && <span className="vc-badge vc-badge-sage text-[10px]">−{discount}%</span>}
                </div>

                {/* Wishlist */}
                <button onClick={handleWishlist} disabled={wishLoading}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-md flex items-center justify-center transition-all z-10 ${isInWishlist(p.id)
                        ? 'bg-vcError/15 text-vcError'
                        : 'bg-vc-bg/40 text-onSurfaceVar opacity-0 group-hover:opacity-100 hover:text-vcError hover:bg-vcError/15'
                    }`}>
                    <svg className="w-4 h-4" fill={isInWishlist(p.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isInWishlist(p.id) ? 0 : 1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-vc-bg/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-xs text-onSurface/80 font-medium bg-vc-surface-high/80 backdrop-blur-sm px-3 py-1 rounded-md">View Details →</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                    {p.brand && <span className="text-[10px] text-outline uppercase tracking-wider font-medium">{p.brand}</span>}
                    {rating > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex">{renderStars()}</div>
                            <span className="text-[10px] text-outline">({p.reviewCount})</span>
                        </div>
                    )}
                </div>

                <h3 className="text-sm font-semibold text-onSurface mb-2 line-clamp-2 group-hover:text-sage transition-colors duration-200 leading-snug">{p.name}</h3>

                {p.healthGoals && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(p.healthGoals) ? p.healthGoals : p.healthGoals.split(',')).slice(0, 2).map((g: string) => (
                            <span key={g} className="vc-badge vc-badge-sage text-[9px] py-0.5 px-2">{g.trim()}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-outlineVar/15">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-onSurface">${(p.discountPrice || p.price).toFixed(2)}</span>
                        {p.discountPrice && (
                            <span className="text-[11px] text-outline line-through">${p.price.toFixed(2)}</span>
                        )}
                    </div>
                    <button onClick={handleAdd} disabled={adding}
                        className={`w-8 h-8 rounded-md flex items-center justify-center transition-all text-sm font-bold ${added
                            ? 'bg-sage/15 text-sage'
                            : 'bg-sage/10 text-sage hover:bg-sage/20 active:scale-95'
                        }`}>
                        {adding ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        ) : added ? '✓' : '+'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
