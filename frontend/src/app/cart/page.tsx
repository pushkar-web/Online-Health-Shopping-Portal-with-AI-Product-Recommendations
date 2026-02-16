'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/store';
import toast from 'react-hot-toast';
import { couponAPI } from '@/lib/api';

export default function CartPage() {
    const { items, loading, fetchCart, updateQty, removeItem, getTotal, getFinalTotal, getDiscount, coupon, applyCoupon, clearCoupon, getCount } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);

    useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);

    const handleRemove = async (itemId: number) => {
        await removeItem(itemId);
        toast.success('Item removed from cart');
    };

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await couponAPI.validate(couponCode, getTotal());
            applyCoupon(res.data);
            toast.success('Coupon applied successfully! 🎉');
            setCouponCode('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid coupon code');
            clearCoupon();
        } finally {
            setCouponLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔒</span>
                <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
                <p className="text-gray-400 mb-6">You need to be logged in to view your cart</p>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">🛒 Shopping Cart</h1>
            <p className="text-gray-400 mb-8">{getCount()} items in your cart</p>

            {items.length === 0 ? (
                <div className="text-center py-20 glass-light rounded-2xl">
                    <span className="text-6xl block mb-4">🛒</span>
                    <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
                    <p className="text-gray-400 mb-6">Start shopping for health products</p>
                    <Link href="/products" className="btn-primary px-8 py-3">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item: any) => (
                            <div key={item.id} className="glass-light rounded-xl p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                                    {item.productImage && item.productImage.startsWith('http') ? (
                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>💊</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white truncate">{item.productName}</h3>
                                    <p className="text-sm text-gray-400">${(item.productDiscountPrice || item.productPrice)?.toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center glass rounded-lg">
                                    <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-1 text-gray-400 hover:text-white text-sm">−</button>
                                    <span className="px-3 py-1 text-white text-sm font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-400 hover:text-white text-sm">+</button>
                                </div>
                                <span className="text-white font-semibold w-20 text-right">${item.totalPrice?.toFixed(2)}</span>
                                <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-300 text-lg">✕</button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="glass rounded-xl p-6 h-fit sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${getTotal().toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-green-400">Free</span></div>

                            {/* Coupon Display */}
                            {coupon && (
                                <div className="flex justify-between text-green-400 bg-green-400/10 p-2 rounded">
                                    <span className="flex items-center gap-2">
                                        🎫 {coupon.code}
                                        <button onClick={clearCoupon} className="text-xs hover:text-white">✕</button>
                                    </span>
                                    <span>-${getDiscount().toFixed(2)}</span>
                                </div>
                            )}

                            {/* Coupon Input */}
                            {!coupon && (
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Coupon Code"
                                        className="bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm w-full text-white placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={couponLoading || !couponCode}
                                        className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
                                    >
                                        {couponLoading ? '...' : 'Apply'}
                                    </button>
                                </form>
                            )}

                            <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                                <span>Total</span><span>${getFinalTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <Link href="/checkout"
                            className="btn-accent w-full py-3 text-center block"
                            onClick={() => {
                                // Persist final total or coupon if needed, but store handles it
                            }}
                        >
                            🚀 Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
