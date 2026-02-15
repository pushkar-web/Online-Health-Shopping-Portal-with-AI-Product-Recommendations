'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, ArrowRight } from 'lucide-react';

interface Props { bundle: any; }

export default function BundleCard({ bundle }: Props) {
    const { addToCart } = useCartStore();
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        setAdding(true);
        try {
            for (const p of bundle.products) {
                await addToCart(p.id, 1);
            }
            toast.success(`added ${bundle.title} to cart!`);
        } catch {
            toast.error('Failed to add bundle');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="glass rounded-xl p-6 relative overflow-hidden group border border-primary-500/20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent opacity-50" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="badge badge-purple mb-2 inline-block">✨ AI Power Pair</span>
                        <h3 className="text-xl font-bold text-white leading-tight mb-1">{bundle.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{bundle.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary-400">${bundle.discountedPrice.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 line-through">${bundle.totalPrice.toFixed(2)}</div>
                        <div className="text-xs text-green-400 font-bold">Save {bundle.discountPercentage}%</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    {bundle.products.map((p: any, i: number) => (
                        <div key={p.id} className="flex items-center">
                            <div className="relative w-16 h-16 rounded-lg bg-gray-800 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">💊</div>
                                )}
                            </div>
                            {i < bundle.products.length - 1 && (
                                <Plus className="w-4 h-4 text-gray-500 mx-2" />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 group/btn"
                >
                    {adding ? 'Adding...' : 'Add Bundle to Cart'}
                    {!adding && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                </button>
            </div>
        </div>
    );
}
