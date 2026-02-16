'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/admin', icon: '📊', label: 'Dashboard' },
        { href: '/admin/orders', icon: '📋', label: 'Orders' },
        { href: '/admin/products', icon: '📦', label: 'Products' },
        { href: '/admin/users', icon: '👥', label: 'Users' },
        { href: '/admin/coupons', icon: '🎫', label: 'Coupons' },
        { href: '/recommendations', icon: '🤖', label: 'AI Recommendations' },
        { href: '/symptom-search', icon: '💊', label: 'Symptom Search' },
    ];

    return (
        <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 h-screen fixed left-0 top-16 hidden lg:block overflow-y-auto">
            <div className="p-6">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Admin Menu</h2>
                <nav className="space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h2>
                    <nav className="space-y-2">
                        <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <span>🏠</span> Go to Home
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <span>🛍️</span> View Store
                        </Link>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
