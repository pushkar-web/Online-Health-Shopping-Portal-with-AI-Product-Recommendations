'use client';
import { useEffect, useState } from 'react';
import { useCartStore, useAuthStore } from '@/store';
import { orderAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { items, fetchCart, getTotal, coupon, getDiscount } = useCartStore();
    const { isAuthenticated, user, loadUser } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        shippingName: '', shippingAddress: '', shippingCity: '',
        shippingState: '', shippingZip: '', shippingPhone: '',
        paymentMethod: 'CARD',
    });

    useEffect(() => { loadUser(); }, []);
    useEffect(() => { if (isAuthenticated) fetchCart(); }, [isAuthenticated]);

    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                shippingName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                shippingPhone: user.phone || '',
            }));
        }
    }, [user]);

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔒</span>
                <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    const update = (field: string, val: string) => setForm({ ...form, [field]: val });

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) { toast.error('Your cart is empty'); return; }
        setLoading(true);
        try {
            await orderAPI.create({ ...form, couponCode: coupon?.code });
            toast.success('🎉 Order placed successfully!');
            router.push('/orders');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        }
        setLoading(false);
    };

    const subtotal = getTotal();
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const total = Math.max(0, subtotal + shipping + tax - getDiscount());

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl">🛍️</span>
                <div>
                    <h1 className="text-3xl font-bold text-white">Checkout</h1>
                    <p className="text-gray-400">Complete your order</p>
                </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Address */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">📦 Shipping Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Full Name</label>
                                    <input type="text" required value={form.shippingName} onChange={e => update('shippingName', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="John Doe" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Address</label>
                                    <input type="text" required value={form.shippingAddress} onChange={e => update('shippingAddress', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="123 Health Street" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">City</label>
                                    <input type="text" required value={form.shippingCity} onChange={e => update('shippingCity', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="New York" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">State</label>
                                    <input type="text" required value={form.shippingState} onChange={e => update('shippingState', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="NY" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">ZIP Code</label>
                                    <input type="text" required value={form.shippingZip} onChange={e => update('shippingZip', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="10001" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1.5">Phone</label>
                                    <input type="tel" required value={form.shippingPhone} onChange={e => update('shippingPhone', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 transition-all"
                                        placeholder="+1-555-0100" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">💳 Payment Method</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'CARD', label: '💳 Card', desc: 'Visa / MC' },
                                    { id: 'UPI', label: '📱 UPI', desc: 'Google Pay' },
                                    { id: 'BANK', label: '🏦 NetBanking', desc: 'All Banks' },
                                    { id: 'COD', label: '💵 COD', desc: 'Cash on Delivery' },
                                ].map(pm => (
                                    <button key={pm.id} type="button" onClick={() => update('paymentMethod', pm.id)}
                                        className={`glass-light rounded-xl p-4 text-center transition-all border ${form.paymentMethod === pm.id
                                            ? 'border-primary-500/50 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                                            : 'border-transparent hover:border-white/10'
                                            }`}>
                                        <div className="text-xl mb-1">{pm.label.split(' ')[0]}</div>
                                        <div className="text-xs text-gray-400">{pm.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                                            {item.productImage && item.productImage.startsWith('http') ? (
                                                <img src={item.productImage} alt="" className="w-full h-full rounded-lg object-cover" />
                                            ) : '💊'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white truncate">{item.productName}</div>
                                            <div className="text-xs text-gray-500">x{item.quantity}</div>
                                        </div>
                                        <span className="text-sm text-gray-300 font-medium">${(item.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-gray-400"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                                {coupon && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount ({coupon.code})</span>
                                        <span>-${getDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-2 flex justify-between text-white font-bold text-lg">
                                    <span>Total</span><span className="gradient-text">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {subtotal < 50 && (
                                <div className="mt-3 text-xs text-amber-400 bg-amber-500/10 rounded-lg p-2 text-center">
                                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                                </div>
                            )}

                            <button type="submit" disabled={loading || items.length === 0}
                                className="btn-accent w-full py-3.5 text-center mt-4 text-lg disabled:opacity-50">
                                {loading ? '⏳ Processing...' : `🛒 Place Order — $${total.toFixed(2)}`}
                            </button>

                            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-gray-500">
                                {['🔒 Secure', '💳 Encrypted', '📦 Free Returns'].map(b => (
                                    <span key={b} className="bg-white/5 px-2 py-1 rounded">{b}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
