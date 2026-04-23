'use client';
import { useEffect, useState } from 'react';
import { orderAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) return;
        orderAPI.history(0, 20).then(r => {
            setOrders(r.data.content || r.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-onSurface mb-2">Please sign in</h2>
                <Link href="/login" className="btn-sage px-8 py-3">Sign In</Link>
            </div>
        );
    }

    const statusStyles: Record<string, string> = {
        PENDING: 'vc-badge-amber',
        CONFIRMED: 'vc-badge-stone',
        SHIPPED: 'vc-badge-sage',
        DELIVERED: 'vc-badge-sage',
        CANCELLED: 'vc-badge-error',
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <span className="text-xs text-sage font-medium uppercase tracking-widest mb-2 block">History</span>
                <h1 className="text-3xl font-bold text-onSurface">Order History</h1>
                <p className="text-onSurfaceVar text-sm mt-1">Track your past orders</p>
            </div>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-lg" />)}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-vc-surface-high rounded-lg border border-outlineVar/15">
                    <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-sage/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-onSurface mb-2">No orders yet</h3>
                    <p className="text-onSurfaceVar text-sm mb-6">Start shopping for health products</p>
                    <Link href="/products" className="btn-sage px-8 py-3">Shop Now</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o: any) => (
                        <div key={o.id} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 hover:-translate-y-0.5 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base font-semibold text-onSurface">Order #{o.orderNumber || o.id}</span>
                                        <span className={`vc-badge ${statusStyles[o.status] || 'vc-badge-stone'}`}>{o.status}</span>
                                    </div>
                                    <div className="text-sm text-outline">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-onSurface stat-number">${o.totalAmount?.toFixed(2)}</div>
                                    <div className="text-xs text-outline">{o.items?.length} items</div>
                                </div>
                            </div>

                            {/* Tracking Progress */}
                            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status) && (
                                <div className="mb-5 mt-2 relative">
                                    <div className="h-1.5 bg-vc-surface rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sage rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${Math.max(5, (['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(o.status) + 1) * 20)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] mt-1.5 text-outline uppercase tracking-wider">
                                        <span>Ordered</span>
                                        <span>Confirmed</span>
                                        <span>Processing</span>
                                        <span>Shipped</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 bg-vc-surface rounded-md p-3 border border-outlineVar/15">
                                {(o.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-md bg-vc-surface-high flex items-center justify-center overflow-hidden flex-shrink-0 border border-outlineVar/15">
                                            {item.productImage && item.productImage.startsWith('http') ? (
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-3.5 h-3.5 text-sage/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                                            )}
                                        </div>
                                        <span className="text-onSurfaceVar flex-1">{item.productName}</span>
                                        <span className="text-outline">x{item.quantity}</span>
                                        <span className="text-onSurfaceVar font-medium">${(item.totalPrice || item.unitPrice)?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            {o.shippingAddress && (
                                <div className="mt-3 pt-3 border-t border-outlineVar/15 text-xs text-outline flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                    {o.shippingAddress}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
