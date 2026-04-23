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
        toast.success('Item removed');
    };

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await couponAPI.validate(couponCode, getTotal());
            applyCoupon(res.data);
            toast.success('Coupon applied');
            setCouponCode('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid coupon');
            clearCoupon();
        } finally {
            setCouponLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-onSurface mb-2">Sign in to view cart</h2>
                <p className="text-onSurfaceVar mb-8">You need to be signed in to access your cart</p>
                <Link href="/login" className="btn-sage px-8 py-3">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <span className="text-xs text-sage font-medium uppercase tracking-widest mb-2 block">Shopping</span>
                <h1 className="text-3xl font-bold text-onSurface">Your Cart</h1>
                <p className="text-onSurfaceVar text-sm mt-1">{getCount()} {getCount() === 1 ? 'item' : 'items'}</p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-vc-surface-high rounded-lg border border-outlineVar/15">
                    <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-sage/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-onSurface mb-2">Your cart is empty</h3>
                    <p className="text-onSurfaceVar text-sm mb-6">Start shopping for health products</p>
                    <Link href="/products" className="btn-sage px-8 py-3">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item: any) => (
                            <div key={item.id} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-vc-surface rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {item.productImage && item.productImage.startsWith('http') ? (
                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-md" />
                                    ) : (
                                        <svg className="w-8 h-8 text-sage/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-onSurface truncate">{item.productName}</h3>
                                    <p className="text-sm text-outline">${(item.productDiscountPrice || item.productPrice)?.toFixed(2)} each</p>
                                </div>
                                <div className="flex items-center bg-vc-surface rounded-md border border-outlineVar/15">
                                    <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1.5 text-outline hover:text-onSurface text-sm transition-colors">−</button>
                                    <span className="px-3 py-1.5 text-onSurface text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-1.5 text-outline hover:text-onSurface text-sm transition-colors">+</button>
                                </div>
                                <span className="text-onSurface font-semibold w-20 text-right">${item.totalPrice?.toFixed(2)}</span>
                                <button onClick={() => handleRemove(item.id)} className="text-outline hover:text-vcError transition-colors p-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 h-fit sticky top-24">
                        <h3 className="text-base font-bold text-onSurface mb-5">Order Summary</h3>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-onSurfaceVar"><span>Subtotal</span><span>${getTotal().toFixed(2)}</span></div>
                            <div className="flex justify-between text-onSurfaceVar"><span>Shipping</span><span className="text-sage">Free</span></div>

                            {coupon && (
                                <div className="flex justify-between text-sage bg-sage/8 p-2.5 rounded-md">
                                    <span className="flex items-center gap-2 text-xs">
                                        {coupon.code}
                                        <button onClick={clearCoupon} className="text-outline hover:text-onSurface">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                    <span>-${getDiscount().toFixed(2)}</span>
                                </div>
                            )}

                            {!coupon && (
                                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Coupon Code" className="vc-input text-xs py-2" />
                                    <button type="submit" disabled={couponLoading || !couponCode}
                                        className="btn-ghost px-3 py-2 text-xs disabled:opacity-50 whitespace-nowrap">Apply</button>
                                </form>
                            )}

                            <div className="border-t border-outlineVar/15 pt-3 flex justify-between text-onSurface font-bold text-lg">
                                <span>Total</span><span>${getFinalTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <Link href="/checkout" className="btn-sage w-full py-3 text-center block text-base">
                            Proceed to Checkout
                            <svg className="w-4 h-4 inline ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
