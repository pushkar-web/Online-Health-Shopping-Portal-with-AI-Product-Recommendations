'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
    const [email, setEmail] = useState('');
    const pathname = usePathname();

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) { toast.success('Subscribed successfully'); setEmail(''); }
    };

    if (pathname?.startsWith('/recommendations') || pathname?.startsWith('/admin')) return null;

    return (
        <footer className="bg-vc-surface-low border-t border-outlineVar/15 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="w-8 h-8 rounded-md bg-sage/10 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sage">
                                    <path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z" fill="currentColor" opacity="0.9"/>
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-onSurface tracking-tight">
                                Vita<span className="text-sage">Cart</span> <span className="text-onSurfaceVar text-sm font-medium">AI</span>
                            </span>
                        </div>
                        <p className="text-onSurfaceVar text-sm leading-relaxed mb-6">
                            AI-powered wellness commerce for smarter health decisions. Personalized recommendations based on your unique health profile.
                        </p>
                        <div className="flex gap-3">
                            {['X', 'In', 'Ig', 'Fb'].map(social => (
                                <a key={social} href="#" className="w-8 h-8 rounded-md bg-vc-surface-high border border-outlineVar/15 flex items-center justify-center text-outline text-xs font-medium hover:text-sage hover:border-sage/20 transition-all">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-onSurface font-semibold mb-6 text-sm uppercase tracking-wider">Shop</h3>
                        <ul className="space-y-3 text-sm text-onSurfaceVar">
                            <li><Link href="/products" className="hover:text-sage transition-colors">All Products</Link></li>
                            <li><Link href="/recommendations" className="hover:text-sage transition-colors">AI Recommendations</Link></li>
                            <li><Link href="/symptom-search" className="hover:text-sage transition-colors">Symptom Search</Link></li>
                            <li><Link href="/profile" className="hover:text-sage transition-colors">Health Profile</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-onSurface font-semibold mb-6 text-sm uppercase tracking-wider">Support</h3>
                        <ul className="space-y-3 text-sm text-onSurfaceVar">
                            <li><Link href="/orders" className="hover:text-sage transition-colors">Track Order</Link></li>
                            <li><Link href="/wishlist" className="hover:text-sage transition-colors">Wishlist</Link></li>
                            <li><Link href="/admin" className="hover:text-sage transition-colors">Admin Portal</Link></li>
                            <li><a href="#" className="hover:text-sage transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-onSurface font-semibold mb-6 text-sm uppercase tracking-wider">Stay Updated</h3>
                        <p className="text-onSurfaceVar text-sm mb-4">Health tips and exclusive offers, delivered weekly.</p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="vc-input" required />
                            <button type="submit" className="btn-sage w-full py-2.5 text-sm">Subscribe</button>
                        </form>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="border-t border-outlineVar/15 pt-8 mb-8">
                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-outline">
                        {[
                            { icon: '🚚', text: 'Free Shipping $50+' },
                            { icon: '🌿', text: 'Organic Options' },
                            { icon: '🔬', text: 'Lab Verified' },
                            { icon: '🔄', text: '30-Day Returns' },
                            { icon: '🔒', text: 'Secure Checkout' },
                        ].map(b => (
                            <div key={b.text} className="flex items-center gap-2">
                                <span className="text-base">{b.icon}</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-outlineVar/15 pt-6 text-center text-xs text-outline">
                    <p>&copy; {new Date().getFullYear()} VitaCart AI. Built with care for your wellness journey.</p>
                </div>
            </div>
        </footer>
    );
}
