'use client';
import { useEffect } from 'react';
import { useAuthStore, useWishlistStore, useCartStore } from '@/store';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WishlistPage() {
    const { isAuthenticated } = useAuthStore();
    const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
    const { addToCart } = useCartStore();

    useEffect(() => {
        if (isAuthenticated) fetchWishlist();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-xl bg-vcError/8 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-vcError/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-onSurface mb-2">Sign in to view Wishlist</h2>
                <p className="text-onSurfaceVar text-sm mb-8">Save your favorite health products for later</p>
                <Link href="/login" className="btn-sage px-8 py-3">Sign In</Link>
            </div>
        );
    }

    const handleRemove = async (productId: number) => {
        try {
            await removeFromWishlist(productId);
            toast.success('Removed from wishlist');
        } catch { toast.error('Failed to remove'); }
    };

    const handleMoveToCart = async (productId: number) => {
        try {
            await addToCart(productId, 1);
            await removeFromWishlist(productId);
            toast.success('Moved to cart');
        } catch { toast.error('Failed to add to cart'); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <span className="text-xs text-sage font-medium uppercase tracking-widest mb-2 block">Saved</span>
                <h1 className="text-3xl font-bold text-onSurface">My Wishlist</h1>
                <p className="text-onSurfaceVar text-sm mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
            </div>

            {loading ? (
                <LoadingSpinner text="Loading your wishlist..." />
            ) : items.length === 0 ? (
                <EmptyState
                    icon="💝"
                    title="Your wishlist is empty"
                    description="Browse products and click the heart icon to save your favorites"
                    actionLabel="Browse Products"
                    actionHref="/products"
                />
            ) : (
                <>
                    <div className="flex gap-3 mb-6">
                        <span className="text-sm text-outline">{items.length} product{items.length !== 1 ? 's' : ''} saved</span>
                    </div>

                    <div className="product-grid">
                        {items.map((product: any) => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveToCart(product.id); }}
                                        className="w-8 h-8 rounded-md bg-sage/20 text-sage hover:bg-sage/40 flex items-center justify-center transition-all backdrop-blur-sm"
                                        title="Move to cart"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product.id); }}
                                        className="w-8 h-8 rounded-md bg-vcError/20 text-vcError hover:bg-vcError/40 flex items-center justify-center transition-all backdrop-blur-sm"
                                        title="Remove"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
