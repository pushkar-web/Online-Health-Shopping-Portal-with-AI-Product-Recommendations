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
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuthStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back');
            router.push('/');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Invalid credentials';
            setError(msg);
            toast.error(msg);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex relative">
            {/* Left — Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-9 h-9 rounded-md bg-sage/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sage">
                                    <path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z" fill="currentColor" opacity="0.9"/>
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-onSurface tracking-tight">VitaCart AI</span>
                        </div>
                        <h1 className="text-3xl font-bold text-onSurface mb-2">Welcome back</h1>
                        <p className="text-onSurfaceVar">Sign in to continue your wellness journey</p>
                    </div>

                    {error && (
                        <div className="bg-vcError/8 border border-vcError/20 rounded-md p-3 mb-6 text-sm text-vcError animate-slide-down">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar block mb-2">Email</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="vc-input py-3" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar block mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                                    className="vc-input py-3 pr-10" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-onSurfaceVar transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {showPassword
                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                                        }
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-sage w-full py-3 text-base disabled:opacity-50">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button onClick={() => { setEmail('demo@healthshop.com'); setPassword('demo123'); }}
                            className="text-xs px-3 py-1.5 rounded-md bg-sage/8 text-sage hover:bg-sage/15 transition-all">Demo User</button>
                        <button onClick={() => { setEmail('admin@healthshop.com'); setPassword('admin123'); }}
                            className="text-xs px-3 py-1.5 rounded-md bg-amber/8 text-amber hover:bg-amber/15 transition-all">Admin</button>
                    </div>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-outline">Don&apos;t have an account? </span>
                        <Link href="/register" className="text-sm text-sage hover:text-sage-dim font-medium">Create Account</Link>
                    </div>
                </div>
            </div>

            {/* Right — Visual panel */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-vc-surface-low relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sage/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-amber/4 rounded-full blur-[80px]" />
                </div>
                <div className="relative text-center px-12">
                    <div className="w-20 h-20 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-8">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-sage">
                            <path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z" fill="currentColor" opacity="0.7"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-onSurface mb-3">Your wellness, reimagined</h2>
                    <p className="text-onSurfaceVar text-sm leading-relaxed max-w-sm mx-auto">
                        AI-curated health products, personalized to your unique profile and goals. 
                        Experience intelligent wellness commerce.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-8">
                        {[
                            { num: '500+', label: 'Products' },
                            { num: '10K+', label: 'Reviews' },
                            { num: '99%', label: 'Satisfaction' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <div className="text-lg font-bold text-onSurface">{s.num}</div>
                                <div className="text-[10px] text-outline uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
