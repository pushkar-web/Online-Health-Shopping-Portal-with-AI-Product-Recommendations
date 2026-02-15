'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE', // PERCENTAGE, FIXED
        discountValue: '',
        minPurchaseAmount: '',
        expirationDate: '',
        isActive: true
    });

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') return;
        loadCoupons();
    }, [isAuthenticated, user]);

    const loadCoupons = () => {
        setLoading(true);
        adminAPI.getAllCoupons().then(r => {
            setCoupons(r.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        adminAPI.deleteCoupon(id).then(() => {
            toast.success('Coupon deleted');
            loadCoupons();
        }).catch(() => toast.error('Failed to delete coupon'));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adminAPI.createCoupon({
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
            expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null
        }).then(() => {
            toast.success('Coupon created successfully');
            setIsCreating(false);
            setFormData({
                code: '', discountType: 'PERCENTAGE', discountValue: '',
                minPurchaseAmount: '', expirationDate: '', isActive: true
            });
            loadCoupons();
        }).catch((err) => {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        });
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">🎫 Coupon Management</h1>
                    <p className="text-gray-400 text-sm">Create and manage validation codes</p>
                </div>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn-primary px-4 py-2"
                >
                    {isCreating ? 'Cancel' : '+ Create Coupon'}
                </button>
            </div>

            {isCreating && (
                <div className="glass rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold text-white mb-4">New Coupon</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Coupon Code</label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g. SUMMER2026"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Discount Type</label>
                            <select
                                value={formData.discountType}
                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Discount Value</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.discountValue}
                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 10 (for 10%)' : 'e.g. 5 (for $5 off)'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Min. Purchase ($)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.minPurchaseAmount}
                                onChange={e => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="Optional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Expiration Date</label>
                            <input
                                type="datetime-local"
                                value={formData.expirationDate}
                                onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full btn-primary py-2">Create Coupon</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? <LoadingSpinner text="Loading coupons..." /> : (
                <div className="glass rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase bg-white/[0.02]">
                                <th className="text-left p-4 font-medium">Code</th>
                                <th className="text-left p-4 font-medium">Discount</th>
                                <th className="text-left p-4 font-medium">Min Purchase</th>
                                <th className="text-left p-4 font-medium">Expires</th>
                                <th className="text-center p-4 font-medium">Status</th>
                                <th className="text-right p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {coupons.map(c => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 font-mono font-bold text-white">{c.code}</td>
                                    <td className="p-4 text-gray-300">
                                        {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {c.minPurchaseAmount ? `$${c.minPurchaseAmount}` : '-'}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {c.expirationDate ? new Date(c.expirationDate).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {c.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No coupons found. Create your first one!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
