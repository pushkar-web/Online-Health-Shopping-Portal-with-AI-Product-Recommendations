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
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-onSurface mb-2">Please sign in</h2>
                <Link href="/login" className="btn-sage px-8 py-3">Sign In</Link>
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
            toast.success('Order placed successfully!');
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
            <div className="mb-8">
                <span className="text-xs text-sage font-medium uppercase tracking-widest mb-2 block">Payment</span>
                <h1 className="text-3xl font-bold text-onSurface">Checkout</h1>
                <p className="text-onSurfaceVar text-sm mt-1">Complete your order</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shipping Address */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                            <h2 className="text-base font-semibold text-onSurface mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">Full Name</label>
                                    <input type="text" required value={form.shippingName} onChange={e => update('shippingName', e.target.value)}
                                        className="vc-input py-2.5" placeholder="John Doe" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">Address</label>
                                    <input type="text" required value={form.shippingAddress} onChange={e => update('shippingAddress', e.target.value)}
                                        className="vc-input py-2.5" placeholder="123 Health Street" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">City</label>
                                    <input type="text" required value={form.shippingCity} onChange={e => update('shippingCity', e.target.value)}
                                        className="vc-input py-2.5" placeholder="New York" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">State</label>
                                    <input type="text" required value={form.shippingState} onChange={e => update('shippingState', e.target.value)}
                                        className="vc-input py-2.5" placeholder="NY" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">ZIP Code</label>
                                    <input type="text" required value={form.shippingZip} onChange={e => update('shippingZip', e.target.value)}
                                        className="vc-input py-2.5" placeholder="10001" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-onSurfaceVar block mb-2">Phone</label>
                                    <input type="tel" required value={form.shippingPhone} onChange={e => update('shippingPhone', e.target.value)}
                                        className="vc-input py-2.5" placeholder="+1-555-0100" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                            <h2 className="text-base font-semibold text-onSurface mb-4 flex items-center gap-2">
                                <svg className="w-4 h-4 text-stone" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                Payment Method
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { id: 'CARD', label: 'Card', desc: 'Visa / MC', icon: '💳' },
                                    { id: 'UPI', label: 'UPI', desc: 'Google Pay', icon: '📱' },
                                    { id: 'BANK', label: 'NetBanking', desc: 'All Banks', icon: '🏦' },
                                    { id: 'COD', label: 'COD', desc: 'Cash on Delivery', icon: '💵' },
                                ].map(pm => (
                                    <button key={pm.id} type="button" onClick={() => update('paymentMethod', pm.id)}
                                        className={`bg-vc-surface rounded-lg p-4 text-center transition-all border ${form.paymentMethod === pm.id
                                            ? 'border-sage/40 bg-sage/5'
                                            : 'border-outlineVar/15 hover:border-outlineVar/30'
                                            }`}>
                                        <div className="text-xl mb-1">{pm.icon}</div>
                                        <div className="text-sm text-onSurface font-medium">{pm.label}</div>
                                        <div className="text-[10px] text-outline">{pm.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 sticky top-24">
                            <h2 className="text-base font-semibold text-onSurface mb-4">Order Summary</h2>
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                                {items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-vc-surface flex items-center justify-center flex-shrink-0 overflow-hidden border border-outlineVar/15">
                                            {item.productImage && item.productImage.startsWith('http') ? (
                                                <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <svg className="w-4 h-4 text-sage/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-onSurface truncate">{item.productName}</div>
                                            <div className="text-xs text-outline">x{item.quantity}</div>
                                        </div>
                                        <span className="text-sm text-onSurfaceVar font-medium">${(item.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-outlineVar/15 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-onSurfaceVar"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-onSurfaceVar">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-sage' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-onSurfaceVar"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                                {coupon && (
                                    <div className="flex justify-between text-sage">
                                        <span>Discount ({coupon.code})</span>
                                        <span>-${getDiscount().toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-outlineVar/15 pt-2 flex justify-between text-onSurface font-bold text-lg">
                                    <span>Total</span><span className="text-sage">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {subtotal < 50 && (
                                <div className="mt-3 text-xs text-amber bg-amber/5 rounded-md p-2 text-center border border-amber/10">
                                    Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                                </div>
                            )}

                            <button type="submit" disabled={loading || items.length === 0}
                                className="btn-sage w-full py-3.5 text-center mt-4 text-base disabled:opacity-50">
                                {loading ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
                            </button>

                            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-outline">
                                {['Secure', 'Encrypted', 'Free Returns'].map(b => (
                                    <span key={b} className="bg-vc-surface px-2 py-1 rounded-md border border-outlineVar/15">{b}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
