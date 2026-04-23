'use client';
import Link from 'next/link';
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
            toast.success(`Added ${bundle.title} to cart`);
        } catch {
            toast.error('Failed to add bundle');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="bg-vc-surface-high rounded-lg border border-sage/15 p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-50" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="vc-badge vc-badge-amber mb-2 inline-block">AI Power Pair</span>
                        <h3 className="text-lg font-bold text-onSurface leading-tight mb-1">{bundle.title}</h3>
                        <p className="text-sm text-onSurfaceVar line-clamp-2">{bundle.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-sage">${bundle.discountedPrice.toFixed(2)}</div>
                        <div className="text-sm text-outline line-through">${bundle.totalPrice.toFixed(2)}</div>
                        <div className="text-xs text-sage font-bold">Save {bundle.discountPercentage}%</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    {bundle.products.map((p: any, i: number) => (
                        <div key={p.id} className="flex items-center">
                            <div className="relative w-14 h-14 rounded-md bg-vc-surface overflow-hidden border border-outlineVar/15 group-hover:scale-105 transition-transform">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-sage/20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C7 4 4 8 4 13c0 3.5 2 6.5 5 8 .8-1.5 2-2.5 3-3 1 .5 2.2 1.5 3 3 3-1.5 5-4.5 5-8 0-5-3-9-8-11z"/></svg>
                                    </div>
                                )}
                            </div>
                            {i < bundle.products.length - 1 && (
                                <Plus className="w-3.5 h-3.5 text-outline mx-2" />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="w-full btn-sage py-3 flex items-center justify-center gap-2 group/btn"
                >
                    {adding ? 'Adding...' : 'Add Bundle to Cart'}
                    {!adding && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                </button>
            </div>
        </div>
    );
}
