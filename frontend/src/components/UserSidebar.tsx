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
        { href: '/recommendations', icon: <Sparkles size={18} />, label: 'Overview' },
        { href: '/recommendations/health-score', icon: <Activity size={18} />, label: 'Wellness Score' },
        { href: '/recommendations/nutrition-gaps', icon: <Apple size={18} />, label: 'Nutrition Tracker' },
        { href: '/recommendations/purchase-insights', icon: <BarChart3 size={18} />, label: 'Purchase Insights' },
    ];

    const toolLinks = [
        { href: '/ai/chat', icon: <MessageSquare size={18} />, label: 'AI Chat' },
        { href: '/profile', icon: <User size={18} />, label: 'My Profile' },
    ];

    return (
        <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 h-[calc(100vh-4rem)] fixed left-0 top-16 hidden lg:block overflow-y-auto z-40">
            <div className="p-5">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                        <Pill size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-tight">Health AI</span>
                </div>

                {/* Dashboard Section */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Dashboard</h2>
                    <nav className="space-y-1">
                        {mainLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive
                                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5 font-medium'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}>
                                    <span className="flex-shrink-0">{link.icon}</span>
                                    <span>{link.label}</span>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Tools Section */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3">Tools</h2>
                    <nav className="space-y-1">
                        {toolLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive
                                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 font-medium'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }`}>
                                    <span className="flex-shrink-0">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Help Card */}
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="bg-gradient-to-br from-primary-500/10 to-purple-600/10 p-4 rounded-xl border border-white/5">
                        <h3 className="text-xs font-bold text-white mb-1">Need Help?</h3>
                        <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                            Chat with our AI assistant for personalized health guidance.
                        </p>
                        <Link href="/ai/chat" className="block text-center py-2 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 transition-colors">
                            Start AI Chat
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
