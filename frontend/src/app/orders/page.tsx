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
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔒</span>
                <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    const statusColor: any = {
        PENDING: 'badge-amber', CONFIRMED: 'badge-blue', SHIPPED: 'badge-purple',
        DELIVERED: 'badge-green', CANCELLED: 'badge-amber',
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">📦 Order History</h1>
            <p className="text-gray-400 mb-8">Track your past orders</p>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-xl" />)}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 glass-light rounded-2xl">
                    <span className="text-6xl block mb-4">📦</span>
                    <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-gray-400 mb-6">Start shopping for health products</p>
                    <Link href="/products" className="btn-primary px-8 py-3">Shop Now</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o: any) => (
                        <div key={o.id} className="glass-light rounded-xl p-6 hover-card">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base font-semibold text-white">Order #{o.orderNumber || o.id}</span>
                                        <span className={`badge ${statusColor[o.status] || 'badge-blue'}`}>{o.status}</span>
                                    </div>
                                    <div className="text-sm text-gray-400">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">${o.totalAmount?.toFixed(2)}</div>
                                    <div className="text-xs text-gray-500">{o.items?.length} items</div>
                                </div>
                            </div>

                            {/* Tracking Progress */}
                            {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status) && (
                                <div className="mb-6 mt-2 relative">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-green-500 transition-all duration-1000"
                                            style={{
                                                width: `${Math.max(5, (['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(o.status) + 1) * 20)}%`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] mt-2 text-gray-500 uppercase font-medium tracking-wider">
                                        <span>Ordered</span>
                                        <span>Confirmed</span>
                                        <span>Processing</span>
                                        <span>Shipped</span>
                                        <span>Delivered</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 bg-white/5 rounded-lg p-3">
                                {(o.items || []).map((item: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.productImage && item.productImage.startsWith('http') ? (
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">💊</span>
                                            )}
                                        </div>
                                        <span className="text-gray-300 flex-1">{item.productName}</span>
                                        <span className="text-gray-500">x{item.quantity}</span>
                                        <span className="text-gray-400">${(item.totalPrice || item.unitPrice)?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            {o.shippingAddress && (
                                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">📍 {o.shippingAddress}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
