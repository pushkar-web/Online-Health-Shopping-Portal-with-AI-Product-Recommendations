'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back! 🌟');
            router.push('/');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials';
            setError(msg);
            toast.error(msg);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-health-900/20" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-health-500/5 rounded-full blur-3xl" />
            <div className="w-full max-w-md relative">
                <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/30">
                    <div className="text-center mb-8">
                        <span className="text-4xl block mb-3 animate-float">💊</span>
                        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                        <p className="text-sm text-gray-400 mt-1">Sign in to your HealthShop account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6 text-sm text-red-400 animate-slide-down">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 transition-all"
                                placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1.5">Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 transition-all"
                                placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full py-3 text-center disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button onClick={() => { setEmail('demo@healthshop.com'); setPassword('demo123'); }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-all">👤 Demo User</button>
                        <button onClick={() => { setEmail('admin@healthshop.com'); setPassword('admin123'); }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all">🔑 Admin</button>
                    </div>

                    <div className="mt-4 text-center">
                        <span className="text-sm text-gray-500">Don&apos;t have an account? </span>
                        <Link href="/register" className="text-sm text-primary-400 hover:text-primary-300 font-medium">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
