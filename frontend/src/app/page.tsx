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
        { name: 'Heart Health', icon: '❤️', color: 'from-rose-900/20 to-rose-800/10' },
        { name: 'Fitness', icon: '💪', color: 'from-sage/10 to-sage/5' },
        { name: 'Immunity', icon: '🛡️', color: 'from-emerald-900/20 to-emerald-800/10' },
        { name: 'Brain Health', icon: '🧠', color: 'from-stone/10 to-stone/5' },
        { name: 'Bone Health', icon: '🦴', color: 'from-amber/10 to-amber/5' },
        { name: 'Weight Loss', icon: '⚖️', color: 'from-teal-900/20 to-teal-800/10' },
        { name: 'Sleep', icon: '😴', color: 'from-indigo-900/20 to-indigo-800/10' },
        { name: 'Skin Health', icon: '✨', color: 'from-pink-900/20 to-pink-800/10' },
    ];

    return (
        <div>
            {/* ========== HERO SECTION ========== */}
            <section className="relative overflow-hidden min-h-[90vh] flex items-center">
                {/* Atmospheric orbs */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-sage/4 rounded-full blur-[120px] animate-hero-drift" />
                    <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-stone/4 rounded-full blur-[100px] animate-hero-drift" style={{ animationDelay: '-10s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/3 rounded-full blur-[140px]" />
                </div>

                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: 'radial-gradient(circle, #aad0ae 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left — Copy */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-sage/8 border border-sage/15 mb-8 animate-fade-in">
                                <span className="w-1.5 h-1.5 bg-sage rounded-full animate-pulse" />
                                <span className="text-xs text-sage font-medium tracking-wide">AI-Powered Wellness Commerce</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-onSurface leading-[1.1] mb-6 animate-slide-up tracking-tight">
                                Your health,{' '}
                                <span className="gradient-text">intelligently</span>
                                <br />curated
                            </h1>

                            <p className="text-lg text-onSurfaceVar leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                Discover supplements and wellness products matched to your unique health profile. 
                                AI recommendations that adapt and improve with every purchase.
                            </p>

                            <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                <Link href="/products" className="btn-sage px-8 py-3 text-base">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    Shop Now
                                </Link>
                                <Link href="/symptom-search" className="btn-outline-sage px-8 py-3 text-base">
                                    Talk to AI
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-14 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                                {[
                                    { num: '500+', label: 'Products' },
                                    { num: '10K+', label: 'Reviews' },
                                    { num: '99%', label: 'Satisfaction' },
                                ].map((s) => (
                                    <div key={s.label}>
                                        <div className="text-2xl font-bold text-onSurface stat-number">{s.num}</div>
                                        <div className="text-xs text-outline mt-1 uppercase tracking-wider">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Product showcase cards */}
                        <div className="hidden lg:block relative">
                            <div className="relative w-full h-[520px]">
                                {/* Back card */}
                                <div className="absolute top-8 right-0 w-64 bg-vc-surface-high rounded-lg border border-outlineVar/15 p-5 transform rotate-3 shadow-vc animate-float-slow">
                                    <div className="w-full h-32 bg-gradient-to-br from-stone/10 to-amber/5 rounded-md mb-4 flex items-center justify-center">
                                        <span className="text-4xl opacity-50">🌿</span>
                                    </div>
                                    <div className="h-3 bg-vc-surface-highest rounded w-3/4 mb-2" />
                                    <div className="h-2 bg-vc-surface-highest rounded w-1/2" />
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-lg font-bold text-onSurface">$34.99</span>
                                        <span className="vc-badge vc-badge-sage text-[10px]">98% Match</span>
                                    </div>
                                </div>

                                {/* Middle card */}
                                <div className="absolute top-20 left-8 w-72 bg-vc-surface-high rounded-lg border border-sage/15 p-5 transform -rotate-2 shadow-vc-lg z-10 animate-float">
                                    <div className="w-full h-40 bg-gradient-to-br from-sage/8 to-emerald-900/10 rounded-md mb-4 flex items-center justify-center">
                                        <span className="text-5xl">🍃</span>
                                    </div>
                                    <span className="vc-badge vc-badge-amber mb-2 text-[10px]">AI Recommended</span>
                                    <h4 className="text-sm font-semibold text-onSurface mb-1">Ashwagandha Complex</h4>
                                    <p className="text-xs text-outline mb-3">KSM-66 · 600mg · Stress & Calm</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold text-onSurface">$29.99</span>
                                            <span className="text-xs text-outline line-through">$39.99</span>
                                        </div>
                                        <div className="flex text-amber text-xs">★★★★★</div>
                                    </div>
                                </div>

                                {/* Front card - small */}
                                <div className="absolute bottom-12 right-12 w-48 bg-vc-surface-highest rounded-lg border border-outlineVar/15 p-4 transform rotate-1 shadow-vc z-20 animate-float-delayed">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-md bg-sage/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-onSurface">Health Score</div>
                                            <div className="text-lg font-bold text-sage">87/100</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-vc-surface rounded-full h-1.5">
                                        <div className="bg-sage h-1.5 rounded-full" style={{ width: '87%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        {[
                            { icon: '🚚', text: 'Free Shipping $50+' },
                            { icon: '🌿', text: 'Organic Options' },
                            { icon: '🔬', text: 'Lab Verified' },
                            { icon: '🔄', text: '30-Day Returns' },
                        ].map((b) => (
                            <div key={b.text} className="flex items-center gap-2 text-outline text-sm">
                                <span>{b.icon}</span>
                                <span>{b.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== HEALTH GOALS ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <span className="text-xs text-sage font-medium uppercase tracking-widest mb-3 block">Personalized For You</span>
                    <h2 className="text-3xl font-bold text-onSurface mb-3">Shop by Health Goal</h2>
                    <p className="text-onSurfaceVar max-w-md mx-auto">Products curated for your specific health objectives</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {healthGoals.map((g) => (
                        <Link key={g.name} href={`/products?healthGoal=${encodeURIComponent(g.name)}`}
                            className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-5 text-center transition-all hover:-translate-y-1 hover:border-sage/20 hover:shadow-vc group">
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{g.icon}</span>
                            <span className="text-sm font-semibold text-onSurface">{g.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="section-divider max-w-7xl mx-auto" />

            {/* ========== HOW IT WORKS ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <span className="text-xs text-stone font-medium uppercase tracking-widest mb-3 block">Simple Process</span>
                    <h2 className="text-3xl font-bold text-onSurface mb-3">How It Works</h2>
                    <p className="text-onSurfaceVar">Personalized health products in 3 steps</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: '01', title: 'Set Your Health Profile', desc: 'Tell us your health goals, dietary preferences, and any conditions — our AI learns what you need.' },
                        { step: '02', title: 'Get AI Recommendations', desc: 'Our engine analyzes 500+ products to find the perfect supplements and care products for you.' },
                        { step: '03', title: 'Order & Track', desc: 'Add to cart, checkout securely, and track your orders. Recommendations get smarter over time.' },
                    ].map((item) => (
                        <div key={item.step} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-8 relative overflow-hidden group hover:-translate-y-1 transition-all hover:border-outlineVar/30">
                            <span className="absolute top-6 right-6 text-4xl font-black text-vc-surface-bright/30 group-hover:text-sage/10 transition-colors">{item.step}</span>
                            <div className="w-10 h-10 rounded-md bg-sage/10 flex items-center justify-center mb-5">
                                <span className="text-sage font-bold text-sm">{item.step}</span>
                            </div>
                            <h3 className="text-base font-bold text-onSurface mb-2">{item.title}</h3>
                            <p className="text-sm text-onSurfaceVar leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="section-divider max-w-7xl mx-auto" />

            {/* ========== AI FEATURES ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <span className="text-xs text-amber font-medium uppercase tracking-widest mb-3 block">Intelligent Features</span>
                    <h2 className="text-3xl font-bold text-onSurface mb-3">AI-Powered Health Tools</h2>
                    <p className="text-onSurfaceVar max-w-xl mx-auto">Advanced tools to help you make smarter health decisions</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { href: '/ai/dashboard', icon: '📊', title: 'Health Dashboard', desc: 'AI health score, nutrition gaps, spending insights, and tips.', accent: 'sage' },
                        { href: '/ai/interactions', icon: '⚠️', title: 'Interaction Check', desc: 'Check supplement-drug interactions. Identify risky combinations.', accent: 'amber' },
                        { href: '/ai/compare', icon: '⚖️', title: 'Smart Compare', desc: 'AI comparison across quality, value, and health goal match.', accent: 'stone' },
                        { href: '/symptom-search', icon: '🩺', title: 'Health Chat', desc: 'Describe symptoms. Get assessment, tips, and recommendations.', accent: 'sage' },
                    ].map((f) => (
                        <Link key={f.href} href={f.href}
                            className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 group hover:-translate-y-1 transition-all hover:border-outlineVar/30 hover:shadow-vc">
                            <span className="text-3xl block mb-4">{f.icon}</span>
                            <h3 className="text-sm font-bold text-onSurface mb-2">{f.title}</h3>
                            <p className="text-xs text-onSurfaceVar leading-relaxed mb-4">{f.desc}</p>
                            <span className={`text-xs font-medium ${f.accent === 'sage' ? 'text-sage' : f.accent === 'amber' ? 'text-amber' : 'text-stone'} group-hover:translate-x-1 inline-block transition-transform`}>
                                Explore →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="section-divider max-w-7xl mx-auto" />

            {/* ========== CATEGORIES ========== */}
            {categories.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-onSurface mb-1">Categories</h2>
                            <p className="text-onSurfaceVar text-sm">Browse curated health product categories</p>
                        </div>
                        <Link href="/products" className="text-sage hover:text-sage-dim text-sm font-medium">View All →</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {categories.slice(0, 15).map((c: any) => (
                            <Link key={c.id} href={`/products?categoryId=${c.id}`}
                                className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-4 text-center hover:-translate-y-1 transition-all hover:border-outlineVar/30 group">
                                <span className="text-2xl block mb-2">{c.iconName || '📦'}</span>
                                <span className="text-sm font-medium text-onSurface group-hover:text-sage transition-colors">{c.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ========== FEATURED PRODUCTS ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <span className="text-xs text-amber font-medium uppercase tracking-widest mb-1 block">Hand-Picked</span>
                        <h2 className="text-2xl font-bold text-onSurface">Featured Products</h2>
                    </div>
                    <Link href="/products?featured=true" className="text-sage hover:text-sage-dim text-sm font-medium">View All →</Link>
                </div>
                {loading ? (
                    <div className="product-grid">
                        {[...Array(4)].map((_, i) => <div key={i} className="rounded-lg h-80 shimmer" />)}
                    </div>
                ) : (
                    <div className="product-grid">
                        {featured.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </section>

            {/* ========== TRENDING ========== */}
            {trending.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-xs text-sage font-medium uppercase tracking-widest mb-1 block">Popular</span>
                            <h2 className="text-2xl font-bold text-onSurface">Trending Now</h2>
                        </div>
                    </div>
                    <div className="product-grid">
                        {trending.slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* ========== TESTIMONIALS ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <span className="text-xs text-stone font-medium uppercase tracking-widest mb-3 block">Trusted</span>
                    <h2 className="text-2xl font-bold text-onSurface mb-3">What Our Customers Say</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { name: 'Sarah M.', role: 'Fitness Enthusiast', text: 'The AI recommendations are spot-on! Suggested the perfect supplement stack for my training goals.', rating: 5 },
                        { name: 'James K.', role: 'Diabetic Care', text: 'Finally a store that understands diabetic needs. The health profile ensures I only see safe products.', rating: 5 },
                        { name: 'Priya R.', role: 'Wellness Coach', text: 'I recommend VitaCart AI to all my clients. The symptom-based search is incredibly helpful.', rating: 5 },
                    ].map((t) => (
                        <div key={t.name} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 hover:-translate-y-1 transition-all">
                            <div className="flex items-center gap-0.5 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-sm ${i < t.rating ? 'text-amber' : 'text-vc-surface-bright'}`}>★</span>
                                ))}
                            </div>
                            <p className="text-sm text-onSurfaceVar mb-5 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-sage/10 flex items-center justify-center text-sage text-sm font-bold">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-onSurface">{t.name}</p>
                                    <p className="text-xs text-outline">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ========== AI CTA ========== */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-vc-surface-high rounded-xl border border-sage/10 p-8 md:p-14 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-amber/3" />
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sage/3 rounded-full blur-[100px]" />
                    <div className="relative text-center max-w-xl mx-auto">
                        <div className="w-14 h-14 rounded-lg bg-sage/10 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-7 h-7 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-onSurface mb-4">Not sure what you need?</h2>
                        <p className="text-onSurfaceVar mb-8">
                            Describe your health concerns and our AI will recommend the right products for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href="/symptom-search" className="btn-sage px-8 py-3 text-base">
                                Try AI Health Chat
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Link>
                            <Link href="/ai/dashboard" className="btn-ghost px-8 py-3 text-base">
                                AI Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
