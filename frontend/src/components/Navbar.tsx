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
        { href: '/', label: 'Home', icon: '🏠' },
        { href: '/products', label: 'Products', icon: '🛍️' },
        { href: '/recommendations', label: 'AI Recommend', icon: '🤖' },
        { href: '/symptom-search', label: 'Health Chat', icon: '💬' },
    ];

    const aiLinks = [
        { href: '/ai/chat', label: 'AI Health Chat', icon: '💬', desc: 'Symptom analysis & tips' },
        { href: '/ai/dashboard', label: 'AI Dashboard', icon: '📊', desc: 'Health score & insights' },
        { href: '/ai/interactions', label: 'Interaction Check', icon: '⚠️', desc: 'Drug interactions' },
        { href: '/ai/compare', label: 'Smart Compare', icon: '⚖️', desc: 'Compare products with AI' },
        { href: '/symptom-search', label: 'Symptom Search', icon: '🩺', desc: 'Legacy symptom checker' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
        }
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'glass'}`}
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <span className="text-2xl group-hover:animate-bounce-subtle transition-transform">💊</span>
                        <span className="text-xl font-bold gradient-text-animated hidden sm:inline">HealthShop AI</span>
                        <span className="text-xl font-bold gradient-text sm:hidden">HSA</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${pathname === l.href
                                    ? 'bg-primary-600/20 text-primary-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}>
                                <span className="mr-1.5">{l.icon}</span>
                                {l.label}
                                {pathname === l.href && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                                )}
                            </Link>
                        ))}
                        {/* AI Tools Dropdown */}
                        <div className="relative"
                            onMouseEnter={() => setAiDropdown(true)}
                            onMouseLeave={() => setAiDropdown(false)}>
                            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/ai') ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                <span className="mr-1.5">🧠</span> AI Tools
                                <svg className="inline-block ml-1 w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            {aiDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-56 glass-strong rounded-xl border border-white/10 shadow-xl shadow-black/30 py-2 animate-fade-in z-50">
                                    {aiLinks.map((al) => (
                                        <Link key={al.href} href={al.href}
                                            onClick={() => setAiDropdown(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${pathname === al.href ? 'text-primary-400 bg-primary-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                            <span className="text-lg">{al.icon}</span>
                                            <div>
                                                <span className="block text-sm font-medium">{al.label}</span>
                                                <span className="block text-[10px] text-gray-600">{al.desc}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search + Right */}
                    <div className="flex items-center gap-2">
                        {/* Desktop Search */}
                        <div className="hidden md:block relative">
                            <form onSubmit={handleSearch} className="relative">
                                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-44 lg:w-56 pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:w-64 lg:focus:w-72 transition-all" />
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </form>
                        </div>

                        {isAuthenticated ? (
                            <>
                                <Link href="/wishlist" className="relative p-2 rounded-lg hover:bg-white/5 transition-all group">
                                    <span className="text-xl group-hover:scale-110 inline-block transition-transform">❤️</span>
                                </Link>
                                <Link href="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition-all group">
                                    <span className="text-xl group-hover:scale-110 inline-block transition-transform">🛒</span>
                                    {getCount() > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold px-1 animate-scale-in shadow-lg shadow-red-500/30">
                                            {getCount()}
                                        </span>
                                    )}
                                </Link>
                                <Link href="/orders" className="hidden sm:flex p-2 rounded-lg hover:bg-white/5 transition-all text-gray-400 hover:text-white text-sm items-center gap-1">
                                    <span>📦</span> Orders
                                </Link>
                                {user?.role === 'ADMIN' && (
                                    <Link href="/admin" className="hidden sm:flex p-2 rounded-lg hover:bg-white/5 transition-all text-gray-400 hover:text-white text-sm items-center gap-1">
                                        <span>⚙️</span> Admin
                                    </Link>
                                )}
                                <Link href="/profile" className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                </Link>
                                <button onClick={logout} className="hidden sm:flex px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all items-center gap-1">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">Login</Link>
                                <Link href="/register" className="btn-primary text-sm">Sign Up</Link>
                            </>
                        )}

                        {/* Mobile burger */}
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                            {mobileOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu with slide animation */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <form onSubmit={handleSearch} className="relative mb-3">
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50" />
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </form>
                    <div className="border-t border-white/5 pt-2">
                        {links.map((l, i) => (
                            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-all animate-slide-in-right ${pathname === l.href ? 'text-primary-400 bg-primary-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                style={{ animationDelay: `${i * 50}ms` }}>
                                <span>{l.icon}</span>
                                {l.label}
                            </Link>
                        ))}
                        {/* Mobile AI Links */}
                        <div className="border-t border-white/5 mt-2 pt-2 px-2">
                            <span className="text-[10px] text-gray-600 px-2 uppercase tracking-wider">AI Tools</span>
                            {aiLinks.map((al, i) => (
                                <Link key={al.href} href={al.href} onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all ${pathname === al.href ? 'text-primary-400 bg-primary-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    <span>{al.icon}</span>
                                    {al.label}
                                </Link>
                            ))}
                        </div>
                        {isAuthenticated && (
                            <div className="border-t border-white/5 mt-2 pt-2 flex gap-2 px-2">
                                <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">📦 Orders</Link>
                                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex-1 text-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
