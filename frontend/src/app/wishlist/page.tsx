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
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">❤️</span>
                <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your Wishlist</h2>
                <p className="text-gray-400 mb-6">Save your favorite health products for later</p>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
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
            toast.success('Moved to cart!');
        } catch { toast.error('Failed to add to cart'); }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl">❤️</span>
                <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            </div>
            <p className="text-gray-400 mb-8">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

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
                    {/* Bulk actions */}
                    <div className="flex gap-3 mb-6">
                        <span className="text-sm text-gray-500">{items.length} product{items.length !== 1 ? 's' : ''} saved</span>
                    </div>

                    <div className="product-grid">
                        {items.map((product: any) => (
                            <div key={product.id} className="relative group">
                                <ProductCard product={product} />
                                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMoveToCart(product.id); }}
                                        className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/40 flex items-center justify-center text-xs transition-all backdrop-blur-sm"
                                        title="Move to cart"
                                    >🛒</button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(product.id); }}
                                        className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 flex items-center justify-center text-xs transition-all backdrop-blur-sm"
                                        title="Remove"
                                    >✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
