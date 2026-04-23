'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/admin', label: 'Dashboard', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { href: '/admin/orders', label: 'Orders', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
        { href: '/admin/products', label: 'Products', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
        { href: '/admin/users', label: 'Users', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { href: '/admin/coupons', label: 'Coupons', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
        { href: '/admin/ai', label: 'AI Analytics', icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
    ];

    return (
        <aside className="w-60 bg-vc-surface-low border-r border-outlineVar/15 h-screen fixed left-0 top-16 hidden lg:block overflow-y-auto">
            <div className="p-5">
                <h2 className="text-[10px] font-semibold text-outline uppercase tracking-widest mb-4 px-3">Admin</h2>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link key={link.href} href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${isActive
                                    ? 'bg-sage/10 text-sage font-medium'
                                    : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/50'
                                }`}>
                                {link.icon}
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-8 pt-6 border-t border-outlineVar/15">
                    <h2 className="text-[10px] font-semibold text-outline uppercase tracking-widest mb-4 px-3">Quick Links</h2>
                    <nav className="space-y-1">
                        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-onSurfaceVar hover:text-onSurface rounded-md hover:bg-vc-surface-high/50 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Home
                        </Link>
                        <Link href="/products" className="flex items-center gap-3 px-3 py-2 text-sm text-onSurfaceVar hover:text-onSurface rounded-md hover:bg-vc-surface-high/50 transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            Store
                        </Link>
                    </nav>
                </div>
            </div>
        </aside>
    );
}
