'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const { isAuthenticated, user, logout, loadUser } = useAuthStore();
    const { getCount, fetchCart } = useCartStore();
    const { fetchWishlist } = useWishlistStore();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [aiDropdown, setAiDropdown] = useState(false);

    useEffect(() => {
        setMounted(true);
        loadUser();
        if (isAuthenticated) { fetchCart(); fetchWishlist(); }
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) return null;

    const links = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Shop' },
        { href: '/recommendations', label: 'For You' },
    ];

    const aiLinks = [
        { href: '/ai/chat', label: 'AI Health Chat', desc: 'RAG + Groq powered chat' },
        { href: '/symptom-search', label: 'Symptom Checker', desc: 'AI symptom analysis' },
        { href: '/ai/scan', label: 'Scan Label', desc: 'Scan supplement labels' },
        { href: '/health-shield', label: 'Health Shield', desc: 'Seasonal threat alerts' },
        { href: '/challenges', label: 'Challenges', desc: 'Wellness quests' },
        { href: '/learn', label: 'Learn Health', desc: 'AI lessons & quizzes' },
        { href: '/ai/dashboard', label: 'AI Dashboard', desc: 'Health score & insights' },
        { href: '/ai/interactions', label: 'Interaction Check', desc: 'Drug interactions' },
        { href: '/ai/compare', label: 'Smart Compare', desc: 'Compare products' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    const isActive = (href: string) => pathname === href;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'vc-glass shadow-vc' : 'bg-vc-bg/80 backdrop-blur-sm border-b border-transparent'}`}
            style={{ borderBottomColor: scrolled ? 'var(--vc-ghost-border)' : 'transparent' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-md bg-sage/10 flex items-center justify-center group-hover:bg-sage/20 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-sage">
                                <path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z" fill="currentColor" opacity="0.9"/>
                                <path d="M12 8v6M9 11h6" stroke="#15371f" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-onSurface tracking-tight hidden sm:inline">
                            Vita<span className="text-sage">Cart</span> <span className="text-onSurfaceVar text-sm font-medium">AI</span>
                        </span>
                        <span className="text-lg font-bold text-sage sm:hidden">VC</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${isActive(l.href)
                                    ? 'text-sage bg-sage/8'
                                    : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/60'
                                }`}>
                                {l.label}
                                {isActive(l.href) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-sage rounded-full" />
                                )}
                            </Link>
                        ))}
                        {/* AI Tools Dropdown */}
                        <div className="relative"
                            onMouseEnter={() => setAiDropdown(true)}
                            onMouseLeave={() => setAiDropdown(false)}>
                            <button className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${pathname.startsWith('/ai') || pathname.startsWith('/symptom') || pathname.startsWith('/health-shield') || pathname.startsWith('/challenges') || pathname.startsWith('/learn')
                                ? 'text-sage bg-sage/8'
                                : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/60'
                            }`}>
                                AI Tools
                                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {aiDropdown && (
                                <div className="absolute top-full left-0 mt-1.5 w-56 bg-vc-surface-high rounded-lg border border-outlineVar/30 shadow-vc-lg py-1.5 animate-fade-in z-50">
                                    {aiLinks.map((al) => (
                                        <Link key={al.href} href={al.href}
                                            onClick={() => setAiDropdown(false)}
                                            className={`flex flex-col px-4 py-2.5 transition-all ${isActive(al.href) ? 'text-sage bg-sage/8' : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-highest/60'}`}>
                                            <span className="text-sm font-medium">{al.label}</span>
                                            <span className="text-[10px] text-outline mt-0.5">{al.desc}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search + Right */}
                    <div className="flex items-center gap-1.5">
                        {/* Desktop Search */}
                        <div className="hidden md:block relative">
                            <form onSubmit={handleSearch} className="relative">
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-44 lg:w-52 pl-9 pr-3 py-1.5 rounded-md bg-vc-surface-high border border-outlineVar/20 text-sm text-onSurface placeholder:text-outline focus:outline-none focus:border-sage/40 focus:w-64 lg:focus:w-72 transition-all" />
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </form>
                        </div>

                        {isAuthenticated ? (
                            <>
                                <Link href="/wishlist" className="relative p-2 rounded-md hover:bg-vc-surface-high/60 transition-all group" title="Wishlist">
                                    <svg className="w-5 h-5 text-onSurfaceVar group-hover:text-sage transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </Link>
                                <Link href="/cart" className="relative p-2 rounded-md hover:bg-vc-surface-high/60 transition-all group" title="Cart">
                                    <svg className="w-5 h-5 text-onSurfaceVar group-hover:text-sage transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    {getCount() > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-sage text-sage-on rounded-full text-[10px] flex items-center justify-center font-bold px-1 animate-scale-in">
                                            {getCount()}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/orders" className="hidden sm:flex p-2 rounded-md hover:bg-vc-surface-high/60 transition-all text-onSurfaceVar hover:text-sage text-sm items-center gap-1" title="Orders">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </Link>
                                {user?.role === 'ADMIN' && (
                                    <Link href="/admin" className="hidden sm:flex p-2 rounded-md hover:bg-vc-surface-high/60 transition-all text-onSurfaceVar hover:text-amber text-sm items-center gap-1" title="Admin">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </Link>
                                )}
                                <Link href="/profile" className="p-1 rounded-md hover:bg-vc-surface-high/60 transition-all ml-0.5">
                                    <div className="w-7 h-7 rounded-md bg-sage/15 flex items-center justify-center text-sage text-xs font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                </Link>
                                <button onClick={logout} className="hidden sm:flex px-3 py-1.5 rounded-md text-vcError/80 hover:text-vcError hover:bg-vcError/8 text-xs font-medium transition-all items-center">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-3 py-1.5 rounded-md text-sm font-medium text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/60 transition-all">Sign In</Link>
                                <Link href="/register" className="btn-sage text-sm px-4 py-1.5">Get Started</Link>
                            </>
                        )}

                        {/* Mobile burger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-onSurfaceVar hover:text-onSurface transition-colors">
                            {mobileOpen ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <form onSubmit={handleSearch} className="relative mb-3">
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full vc-input pl-9" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>
                    <div className="border-t border-outlineVar/20 pt-2">
                        {links.map((l, i) => (
                            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                className={`flex items-center px-4 py-2.5 text-sm rounded-md transition-all animate-slide-in-right ${isActive(l.href) ? 'text-sage bg-sage/8' : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/40'}`}
                                style={{ animationDelay: `${i * 50}ms` }}>
                                {l.label}
                            </Link>
                        ))}
                        <div className="border-t border-outlineVar/20 mt-2 pt-2 px-2">
                            <span className="text-[10px] text-outline px-2 uppercase tracking-wider font-medium">AI Tools</span>
                            {aiLinks.map((al) => (
                                <Link key={al.href} href={al.href} onClick={() => setMobileOpen(false)}
                                    className={`flex items-center px-4 py-2 text-sm rounded-md transition-all ${isActive(al.href) ? 'text-sage bg-sage/8' : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/40'}`}>
                                    {al.label}
                                </Link>
                            ))}
                        </div>
                        {isAuthenticated && (
                            <div className="border-t border-outlineVar/20 mt-2 pt-2 flex gap-2 px-2">
                                <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-3 py-2 text-sm text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/40 rounded-md transition-all">Orders</Link>
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex-1 text-center px-3 py-2 text-sm text-vcError/80 hover:bg-vcError/8 rounded-md transition-all">Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
