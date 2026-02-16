'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Footer() {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            toast.success('Thanks for subscribing!');
            setEmail('');
        }
    };

    const pathname = usePathname();
    if (pathname?.startsWith('/recommendations') || pathname?.startsWith('/admin')) return null;

    return (
        <footer className="bg-slate-900 border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-3xl">🏥</span>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-health-400">
                                HealthShop AI
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Your trusted partner for AI-powered health solutions. Personalized recommendations, symptom analysis, and premium products.
                        </p>
                        <div className="flex gap-4">
                            {['twitter', 'facebook', 'instagram', 'linkedin'].map(social => (
                                <a key={social} href={`#${social}`} className="text-gray-500 hover:text-primary-400 transition-colors">
                                    <span className="sr-only">{social}</span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">
                                        📱
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/products" className="hover:text-primary-400 transition-colors">Shop All Products</Link></li>
                            <li><Link href="/recommendations" className="hover:text-primary-400 transition-colors">AI Recommendations</Link></li>
                            <li><Link href="/symptom-search" className="hover:text-primary-400 transition-colors">Symptom Search</Link></li>
                            <li><Link href="/profile" className="hover:text-primary-400 transition-colors">Health Profile</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Support</h3>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/orders" className="hover:text-primary-400 transition-colors">Track Your Order</Link></li>
                            <li><Link href="/wishlist" className="hover:text-primary-400 transition-colors">My Wishlist</Link></li>
                            <li><Link href="/admin" className="hover:text-primary-400 transition-colors">Admin Portal</Link></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">Get the latest health tips and exclusive offers.</p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50"
                                required
                            />
                            <button type="submit" className="w-full btn-primary py-2.5 text-sm">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} HealthShop AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
