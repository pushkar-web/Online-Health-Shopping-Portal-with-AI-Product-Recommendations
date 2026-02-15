'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await register(form);
            router.push('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const update = (field: string, val: string) => setForm({ ...form, [field]: val });

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="glass rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <span className="text-4xl block mb-3">🌿</span>
                        <h1 className="text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-sm text-gray-400 mt-1">Join HealthShop for personalized recommendations</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-400">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">First Name</label>
                                <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" placeholder="John" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300 block mb-1.5">Last Name</label>
                                <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
                            <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Phone</label>
                            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" placeholder="+1-555-0100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
                            <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" placeholder="Min 6 characters" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-accent w-full py-3 text-center disabled:opacity-50">
                            {loading ? 'Creating...' : '🚀 Create Account'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">Already have an account? </span>
                        <Link href="/login" className="text-sm text-primary-400 hover:text-primary-300 font-medium">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
