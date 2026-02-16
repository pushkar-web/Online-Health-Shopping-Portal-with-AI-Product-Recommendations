'use client';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-950">
            <AdminSidebar />
            <main className="lg:ml-64 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}
