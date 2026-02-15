'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') return;
        loadOrders();
    }, [isAuthenticated, user]);

    const loadOrders = () => {
        setLoading(true);
        adminAPI.getAllOrders().then(r => {
            setOrders(r.data.content || r.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        setUpdating(id);
        try {
            await adminAPI.updateOrderStatus(id, newStatus);
            toast.success('Order status updated');
            loadOrders();
        } catch (err: any) {
            toast.error('Failed to update status');
        }
        setUpdating(null);
    };

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <span className="text-5xl block mb-4">🔐</span>
                <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In as Admin</Link>
            </div>
        );
    }

    const statusColors: any = {
        PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        PROCESSING: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        SHIPPED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        DELIVERED: 'bg-green-500/10 text-green-400 border-green-500/20',
        CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">← Dashboard</Link>
                    <h1 className="text-2xl font-bold text-white">📦 Order Management</h1>
                </div>
                <button onClick={loadOrders} className="btn-outline px-4 py-2 text-sm">↻ Refresh</button>
            </div>

            {loading ? <LoadingSpinner text="Loading orders..." /> : (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase bg-white/[0.02]">
                                    <th className="text-left p-4 font-medium">Order ID</th>
                                    <th className="text-left p-4 font-medium">Customer</th>
                                    <th className="text-left p-4 font-medium">Date</th>
                                    <th className="text-right p-4 font-medium">Total</th>
                                    <th className="text-center p-4 font-medium">Status</th>
                                    <th className="text-right p-4 font-medium">Update Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-mono text-gray-400">#{o.id}</td>
                                        <td className="p-4">
                                            <div className="text-white font-medium">{o.shippingName || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{o.shippingCity}, {o.shippingState}</div>
                                        </td>
                                        <td className="p-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right text-white font-medium">${o.totalAmount.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[o.status] || 'bg-gray-500/10 text-gray-400'}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                                                disabled={updating === o.id}
                                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary-500 disabled:opacity-50"
                                            >
                                                {statuses.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
                                            </select>
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
