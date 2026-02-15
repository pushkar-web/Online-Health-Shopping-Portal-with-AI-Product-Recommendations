'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, useAuthStore, useWishlistStore } from '@/store';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props { product: any; }

const categoryEmojis: Record<string, string> = {
    'Vitamins & Supplements': '💊',
    'Diabetic Care': '🩸',
    'Fitness Nutrition': '💪',
    'Personal Care': '🧴',
    'Medical Devices': '🩺',
    'Heart & Cardiovascular': '❤️',
    'Immunity Boosters': '🛡️',
    'Weight Management': '⚖️',
    'Bone & Joint Care': '🦴',
    'Skin & Hair Care': '✨',
};

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
    const emoji = categoryEmojis[p.category?.name || p.categoryName] || '💊';
    const rating = p.averageRating || 0;
    const hasImage = p.imageUrl && p.imageUrl.startsWith('http') && !imgError;

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        setAdding(true);
        try { await addToCart(p.id, 1); setAdded(true); toast.success(`Added ${p.name} to cart`); setTimeout(() => setAdded(false), 1500); } catch { toast.error('Failed to add to cart'); }
        setAdding(false);
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!isAuthenticated) { window.location.href = '/login'; return; }
        setWishLoading(true);
        try {
            if (isInWishlist(p.id)) { await removeFromWishlist(p.id); toast.success('Removed from wishlist'); }
            else { await addToWishlist(p.id); toast.success('Added to wishlist ❤️'); }
        } catch { toast.error('Wishlist update failed'); }
        setWishLoading(false);
    };

    const renderStars = () => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'} style={{ fontSize: '11px' }}>★</span>
        ));
    };

    return (
        <Link href={`/products/${p.id}`} className="glass-light rounded-xl overflow-hidden hover-card block group relative">
            {/* Image area */}
            <div className="relative h-48 bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center overflow-hidden">
                {hasImage ? (
                    <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-health-500/5 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100" />
                        </div>
                        <span className="text-6xl opacity-50 group-hover:opacity-80 group-hover:scale-125 transition-all duration-500 relative z-10">{emoji}</span>
                    </>
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {p.featured && (
                        <span className="badge badge-amber text-[10px] shadow-lg shadow-amber-500/20">⭐ Featured</span>
                    )}
                    {discount > 0 && (
                        <span className="badge badge-green text-[10px] shadow-lg shadow-green-500/20">-{discount}% OFF</span>
                    )}
                </div>

                {/* Wishlist heart */}
                <button onClick={handleWishlist} disabled={wishLoading}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm ${isInWishlist(p.id) ? 'bg-red-500/20 text-red-400 scale-110' : 'bg-black/30 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/20'
                        }`}>
                    {isInWishlist(p.id) ? '❤️' : '🤍'}
                </button>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-xs text-white/80 font-medium bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">View Details →</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                    {p.brand && <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{p.brand}</span>}
                    {rating > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex">{renderStars()}</div>
                            <span className="text-[10px] text-gray-500">({p.reviewCount})</span>
                        </div>
                    )}
                </div>

                <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors duration-200 leading-snug">{p.name}</h3>

                {p.healthGoals && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(p.healthGoals) ? p.healthGoals : p.healthGoals.split(',')).slice(0, 2).map((g: string) => (
                            <span key={g} className="badge badge-blue text-[9px] py-0.5 px-2">{g.trim()}</span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-white">${(p.discountPrice || p.price).toFixed(2)}</span>
                        {p.discountPrice && (
                            <span className="text-[11px] text-gray-500 line-through">${p.price.toFixed(2)}</span>
                        )}
                    </div>
                    <button onClick={handleAdd} disabled={adding}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all text-sm font-bold ${added
                            ? 'bg-green-500/20 text-green-400 scale-110'
                            : 'bg-primary-600/20 text-primary-400 hover:bg-primary-600/40 hover:scale-105 active:scale-95'
                            }`}>
                        {adding ? '...' : added ? '✓' : '+'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
