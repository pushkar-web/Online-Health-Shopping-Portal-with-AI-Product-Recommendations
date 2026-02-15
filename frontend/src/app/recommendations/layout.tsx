'use client';
import UserSidebar from '@/components/UserSidebar';
import { useEffect, useState } from 'react';

export default function RecommendationsLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex h-screen bg-gray-900">
                <div className="flex-1 transition-all duration-300">
                    <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            <UserSidebar />
            <div className="flex-1 lg:ml-64 transition-all duration-300">
                <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
