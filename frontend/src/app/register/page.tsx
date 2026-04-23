'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
            toast.success('Account created');
            router.push('/profile');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const update = (field: string, val: string) => setForm({ ...form, [field]: val });

    return (
        <div className="min-h-screen flex relative">
            {/* Left — Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 relative z-10">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <div className="flex items-center gap-2.5 mb-8">
                            <div className="w-9 h-9 rounded-md bg-sage/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sage">
                                    <path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z" fill="currentColor" opacity="0.9"/>
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-onSurface tracking-tight">VitaCart AI</span>
                        </div>
                        <h1 className="text-3xl font-bold text-onSurface mb-2">Create Account</h1>
                        <p className="text-onSurfaceVar">Join VitaCart AI for personalized health recommendations</p>
                    </div>

                    {error && (
                        <div className="bg-vcError/8 border border-vcError/20 rounded-md p-3 mb-6 text-sm text-vcError">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-onSurfaceVar block mb-2">First Name</label>
                                <input type="text" required value={form.firstName} onChange={e => update('firstName', e.target.value)}
                                    className="vc-input py-2.5" placeholder="John" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-onSurfaceVar block mb-2">Last Name</label>
                                <input type="text" required value={form.lastName} onChange={e => update('lastName', e.target.value)}
                                    className="vc-input py-2.5" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar block mb-2">Email</label>
                            <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                                className="vc-input py-2.5" placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar block mb-2">Phone (optional)</label>
                            <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                                className="vc-input py-2.5" placeholder="+1-555-0100" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar block mb-2">Password</label>
                            <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)}
                                className="vc-input py-2.5" placeholder="Min 6 characters" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-sage w-full py-3 text-base disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <span className="text-sm text-outline">Already have an account? </span>
                        <Link href="/login" className="text-sm text-sage hover:text-sage-dim font-medium">Sign In</Link>
                    </div>
                </div>
            </div>

            {/* Right — Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-vc-surface-low relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-stone/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/3 left-1/4 w-[250px] h-[250px] bg-sage/4 rounded-full blur-[80px]" />
                </div>
                <div className="relative text-center px-12">
                    <h2 className="text-2xl font-bold text-onSurface mb-4">Start your wellness journey</h2>
                    <p className="text-onSurfaceVar text-sm leading-relaxed max-w-sm mx-auto mb-8">
                        Get personalized product recommendations, health insights, and curated wellness plans — all powered by AI.
                    </p>
                    <div className="space-y-3">
                        {['AI-powered health recommendations', 'Drug interaction checker', 'Personalized health score', 'Smart product comparisons'].map(f => (
                            <div key={f} className="flex items-center gap-3 text-sm text-onSurfaceVar">
                                <div className="w-5 h-5 rounded-full bg-sage/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
