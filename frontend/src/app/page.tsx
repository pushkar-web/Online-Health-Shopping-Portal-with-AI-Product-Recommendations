'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { productAPI, categoryAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
    const [featured, setFeatured] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 5000);
        Promise.all([
            productAPI.getFeatured().catch(() => ({ data: [] })),
            productAPI.getTrending().catch(() => ({ data: [] })),
            categoryAPI.getAll().catch(() => ({ data: [] })),
        ]).then(([f, t, c]) => {
            setFeatured(f.data); setTrending(t.data); setCategories(c.data);
        }).finally(() => {
            clearTimeout(timeout);
            setLoading(false);
        });
        return () => clearTimeout(timeout);
    }, []);

    const healthGoals = [
        { icon: '❤️', name: 'Heart Health', color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/20' },
        { icon: '💪', name: 'Fitness', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
        { icon: '🛡️', name: 'Immunity', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20' },
        { icon: '🧠', name: 'Brain Health', color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/20' },
        { icon: '🦴', name: 'Bone Health', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/20' },
        { icon: '⚖️', name: 'Weight Loss', color: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/20' },
        { icon: '😴', name: 'Sleep', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20' },
        { icon: '✨', name: 'Skin Health', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-health-900/30" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-health-500/10 rounded-full blur-3xl animate-pulse-slow" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light mb-6 animate-fade-in">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-300">AI-Powered Health Recommendations</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight animate-slide-up">
                            Your Health,{' '}
                            <span className="gradient-text">Personalized</span>
                            <br />by AI
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in">
                            Smart health product recommendations powered by AI. Tell us your health goals,
                            and we&apos;ll find the perfect supplements, devices, and care products for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                            <Link href="/products" className="btn-primary px-8 py-3 text-lg rounded-xl flex items-center gap-2">
                                🛍️ Shop Now
                            </Link>
                            <Link href="/symptom-search" className="btn-accent px-8 py-3 text-lg rounded-xl flex items-center gap-2">
                                🤖 AI Health Chat
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg mx-auto">
                            {[
                                { num: '500+', label: 'Products' },
                                { num: '10K+', label: 'Reviews' },
                                { num: '99%', label: 'Satisfaction' },
                            ].map((s) => (
                                <div key={s.label} className="glass-light rounded-xl p-4">
                                    <div className="text-2xl font-bold gradient-text stat-number">{s.num}</div>
                                    <div className="text-xs text-gray-400">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
                        {[
                            { icon: '🚚', text: 'Free Shipping 50+' },
                            { icon: '🌿', text: '100% Organic Options' },
                            { icon: '🔬', text: 'Lab Verified' },
                            { icon: '🔄', text: '30-Day Returns' },
                            { icon: '🔒', text: 'Secure Checkout' },
                        ].map((b) => (
                            <div key={b.text} className="flex items-center gap-2 text-gray-400 text-sm">
                                <span>{b.icon}</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Health Goals */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-white mb-2">Shop by Health Goal</h2>
                <p className="text-gray-400 mb-8">Find products tailored to your specific health objectives</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {healthGoals.map((g) => (
                        <Link key={g.name} href={`/products?healthGoal=${encodeURIComponent(g.name)}`}
                            className={`glass-light rounded-xl p-5 hover-card text-center border ${g.border}`}>
                            <span className="text-3xl block mb-2">{g.icon}</span>
                            <span className="text-sm font-semibold text-white">{g.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
                    <p className="text-gray-400">Get personalized health products in 3 simple steps</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '01', icon: '📋', title: 'Set Your Health Profile', desc: 'Tell us your health goals, dietary preferences, and any conditions - our AI learns what you need.' },
                        { step: '02', icon: '🤖', title: 'Get AI Recommendations', desc: 'Our engine analyzes 180+ products to find the perfect supplements and care products for you.' },
                        { step: '03', icon: '📦', title: 'Order & Track', desc: 'Add to cart, checkout securely, and track your orders. Recommendations get smarter over time.' },
                    ].map((item) => (
                        <div key={item.step} className="glass-light rounded-2xl p-6 text-center hover-card relative overflow-hidden group">
                            <div className="absolute top-4 right-4 text-4xl font-black text-white/5 group-hover:text-primary-500/10 transition-colors">{item.step}</div>
                            <span className="text-4xl block mb-4">{item.icon}</span>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="section-divider max-w-7xl mx-auto" />

            {/* AI Features Showcase */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-light mb-4">
                        <span className="text-sm">🧠</span>
                        <span className="text-sm text-gray-300">Powered by AI</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">AI-Powered Health Tools</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">Advanced AI features to help you make smarter health decisions</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { href: '/ai/dashboard', icon: '📊', title: 'Health Dashboard', desc: 'Get your AI health score, nutrition gap analysis, spending insights, and personalized improvement tips.', gradient: 'from-primary-600/10 to-blue-600/10', border: 'border-primary-500/10' },
                        { href: '/ai/interactions', icon: '⚠️', title: 'Interaction Checker', desc: 'Check for supplement-drug interactions before you buy. Identify risky combinations and beneficial pairings.', gradient: 'from-amber-600/10 to-red-600/10', border: 'border-amber-500/10' },
                        { href: '/ai/compare', icon: '⚖️', title: 'Smart Compare', desc: 'AI-powered product comparison across 6 dimensions including value, quality, and health goal match.', gradient: 'from-emerald-600/10 to-teal-600/10', border: 'border-emerald-500/10' },
                        { href: '/symptom-search', icon: '🩺', title: 'Health Chat', desc: 'Describe your symptoms in plain language. Get severity assessment, lifestyle tips, and product recommendations.', gradient: 'from-violet-600/10 to-purple-600/10', border: 'border-violet-500/10' },
                    ].map((f) => (
                        <Link key={f.href} href={f.href}
                            className={`glass rounded-xl p-6 hover-card relative overflow-hidden border ${f.border} group`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative">
                                <span className="text-3xl block mb-3">{f.icon}</span>
                                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                                <span className="inline-block mt-3 text-xs text-primary-400 font-medium group-hover:translate-x-1 transition-transform">Try it →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="section-divider max-w-7xl mx-auto" />

            {/* Categories */}
            {categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">Categories</h2>
                            <p className="text-gray-400">Browse our curated health product categories</p>
                        </div>
                        <Link href="/products" className="text-primary-400 hover:text-primary-300 text-sm font-medium">View All ({categories.length}) →</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {categories.slice(0, 15).map((c: any) => (
                            <Link key={c.id} href={`/products?categoryId=${c.id}`}
                                className="glass-light rounded-xl p-4 hover-card text-center">
                                <span className="text-2xl block mb-2">{c.iconName || '📦'}</span>
                                <span className="text-sm font-medium text-white">{c.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Featured Products</h2>
                        <p className="text-gray-400">Hand-picked health essentials</p>
                    </div>
                    <Link href="/products?featured=true" className="text-primary-400 hover:text-primary-300 text-sm font-medium">View All →</Link>
                </div>
                {loading ? (
                    <div className="product-grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl h-80 shimmer" />
                        ))}
                    </div>
                ) : (
                    <div className="product-grid">
                        {featured.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </section>

            {/* Trending */}
            {trending.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white">🔥 Trending Now</h2>
                            <p className="text-gray-400">Most popular products this week</p>
                        </div>
                    </div>
                    <div className="product-grid">
                        {trending.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">What Our Customers Say</h2>
                    <p className="text-gray-400">Trusted by thousands for smarter health shopping</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Sarah M.', role: 'Fitness Enthusiast', text: 'The AI recommendations are spot-on! It suggested the perfect supplement stack for my training goals. Saved me hours of research.', rating: 5 },
                        { name: 'James K.', role: 'Diabetic Care', text: 'Finally a store that understands diabetic needs. The health profile feature ensures I only see products safe for my condition.', rating: 5 },
                        { name: 'Priya R.', role: 'Wellness Coach', text: 'I recommend HealthShop AI to all my clients. The symptom-based search is incredibly helpful for finding the right supplements.', rating: 4 },
                    ].map((t) => (
                        <div key={t.name} className="glass-light rounded-xl p-6 hover-card">
                            <div className="flex items-center gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-sm ${i < t.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                                ))}
                            </div>
                            <p className="text-sm text-gray-300 mb-4 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{t.name}</p>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="glass rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-health-600/10 to-accent-600/10" />
                    <div className="relative">
                        <span className="text-5xl mb-4 block">🤖</span>
                        <h2 className="text-3xl font-bold text-white mb-4">Not sure what you need?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto mb-6">
                            Describe your symptoms or health concerns, and our AI will recommend the right products for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/symptom-search" className="btn-accent px-8 py-3 text-lg rounded-xl inline-flex items-center gap-2">
                                🔬 Try AI Health Chat
                            </Link>
                            <Link href="/ai/dashboard" className="btn-primary px-8 py-3 text-lg rounded-xl inline-flex items-center gap-2">
                                📊 AI Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
