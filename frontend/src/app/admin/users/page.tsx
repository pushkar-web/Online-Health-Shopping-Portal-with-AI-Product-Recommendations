'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function AdminUsersPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') return;
        adminAPI.getAllUsers().then(r => {
            setUsers(r.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [isAuthenticated, user]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔐</span>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In as Admin</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">👥 User Management</h1>
                <div className="text-sm text-gray-400">Total Users: {users.length}</div>
            </div>

            {loading ? <LoadingSpinner text="Loading users..." /> : (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase bg-white/[0.02]">
                                    <th className="text-left p-4 font-medium">ID</th>
                                    <th className="text-left p-4 font-medium">Name</th>
                                    <th className="text-left p-4 font-medium">Email</th>
                                    <th className="text-center p-4 font-medium">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-mono text-gray-400">#{u.id}</td>
                                        <td className="p-4 text-white font-medium">{u.firstName} {u.lastName}</td>
                                        <td className="p-4 text-gray-400">{u.email}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.role === 'ADMIN'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
