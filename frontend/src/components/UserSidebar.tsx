'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sparkles, Heart, MessageSquare, User, BarChart3,
    Apple, Activity, Pill
} from 'lucide-react';

export default function UserSidebar() {
    const pathname = usePathname();

    const mainLinks = [
        { href: '/recommendations', icon: <Sparkles size={16} />, label: 'Overview' },
        { href: '/recommendations/health-score', icon: <Activity size={16} />, label: 'Wellness Score' },
        { href: '/recommendations/nutrition-gaps', icon: <Apple size={16} />, label: 'Nutrition Tracker' },
        { href: '/recommendations/purchase-insights', icon: <BarChart3 size={16} />, label: 'Purchase Insights' },
    ];

    const toolLinks = [
        { href: '/ai/chat', icon: <MessageSquare size={16} />, label: 'AI Chat' },
        { href: '/profile', icon: <User size={16} />, label: 'My Profile' },
    ];

    return (
        <aside className="w-60 bg-vc-surface-low border-r border-outlineVar/15 h-[calc(100vh-4rem)] fixed left-0 top-16 hidden lg:block overflow-y-auto z-40">
            <div className="p-5">
                {/* Brand */}
                <div className="flex items-center gap-2.5 mb-6 px-2">
                    <div className="w-7 h-7 rounded-md bg-sage/10 flex items-center justify-center">
                        <Pill size={14} className="text-sage" />
                    </div>
                    <span className="text-sm font-bold text-onSurface tracking-tight">Health AI</span>
                </div>

                {/* Dashboard Section */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-semibold text-outline uppercase tracking-widest mb-3 px-3">Dashboard</h2>
                    <nav className="space-y-0.5">
                        {mainLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${isActive
                                        ? 'bg-sage/10 text-sage font-medium'
                                        : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/50'
                                    }`}>
                                    <span className="flex-shrink-0">{link.icon}</span>
                                    <span>{link.label}</span>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sage ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Tools Section */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-semibold text-outline uppercase tracking-widest mb-3 px-3">Tools</h2>
                    <nav className="space-y-0.5">
                        {toolLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${isActive
                                        ? 'bg-sage/10 text-sage font-medium'
                                        : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/50'
                                    }`}>
                                    <span className="flex-shrink-0">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Help Card */}
                <div className="mt-auto pt-4 border-t border-outlineVar/15">
                    <div className="bg-sage/5 border border-sage/10 p-4 rounded-lg">
                        <h3 className="text-xs font-bold text-onSurface mb-1">Need Help?</h3>
                        <p className="text-[10px] text-onSurfaceVar leading-relaxed mb-3">
                            Chat with our AI assistant for personalized health guidance.
                        </p>
                        <Link href="/ai/chat" className="block text-center py-2 rounded-md bg-sage/10 text-sage text-xs font-medium hover:bg-sage/20 transition-colors">
                            Start AI Chat
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
