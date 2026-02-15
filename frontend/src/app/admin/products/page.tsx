'use client';
import { useEffect, useState } from 'react';
import { adminAPI, productAPI, categoryAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
    const { user, isAuthenticated, loadUser } = useAuthStore();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [form, setForm] = useState({
        name: '', description: '', price: '', discountPrice: '', stock: '100',
        brand: '', imageUrl: '', categoryId: '', healthGoals: '', tags: '',
        dietaryInfo: '', ingredients: '', benefits: '', featured: false,
    });

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'ADMIN') return;
        loadProducts();
        categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => { });
    }, [isAuthenticated, user]);

    const loadProducts = () => {
        setLoading(true);
        productAPI.getAll({ size: 100 }).then(r => {
            setProducts(r.data.content || r.data || []);
            setLoading(false);
        }).catch(() => setLoading(false));
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

    const openAdd = () => {
        setEditProduct(null);
        setForm({ name: '', description: '', price: '', discountPrice: '', stock: '100', brand: '', imageUrl: '', categoryId: '', healthGoals: '', tags: '', dietaryInfo: '', ingredients: '', benefits: '', featured: false });
        setShowModal(true);
    };

    const openEdit = (p: any) => {
        setEditProduct(p);
        setForm({
            name: p.name || '', description: p.description || '', price: String(p.price || ''),
            discountPrice: String(p.discountPrice || ''), stock: String(p.stock || '100'),
            brand: p.brand || '', imageUrl: p.imageUrl || '',
            categoryId: String(p.categoryId || ''),
            healthGoals: Array.isArray(p.healthGoals) ? p.healthGoals.join(',') : (p.healthGoals || ''),
            tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags || ''),
            dietaryInfo: p.dietaryInfo || '', ingredients: p.ingredients || '',
            benefits: p.benefits || '', featured: p.featured || false,
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...form,
            price: parseFloat(form.price),
            discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
            stock: parseInt(form.stock),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        };
        try {
            if (editProduct) {
                await adminAPI.updateProduct(editProduct.id, data);
                toast.success('Product updated!');
            } else {
                await adminAPI.createProduct(data);
                toast.success('Product created!');
            }
            setShowModal(false);
            loadProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await adminAPI.deleteProduct(id);
            toast.success('Product deleted');
            loadProducts();
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(search.toLowerCase())
    );

    const update = (field: string, val: any) => setForm({ ...form, [field]: val });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">← Dashboard</Link>
                    <h1 className="text-2xl font-bold text-white">📦 Product Management</h1>
                </div>
                <button onClick={openAdd} className="btn-accent px-6 py-2.5">+ Add Product</button>
            </div>

            {/* Search */}
            <div className="glass-light rounded-xl p-4 mb-6">
                <input type="text" placeholder="Search products by name, brand, or category..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" />
            </div>

            {/* Product Table */}
            {loading ? <LoadingSpinner text="Loading products..." /> : (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-500 text-xs uppercase bg-white/[0.02]">
                                    <th className="text-left p-4 font-medium">Product</th>
                                    <th className="text-left p-4 font-medium">Category</th>
                                    <th className="text-right p-4 font-medium">Price</th>
                                    <th className="text-right p-4 font-medium">Stock</th>
                                    <th className="text-center p-4 font-medium">Featured</th>
                                    <th className="text-right p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
                                                    {p.imageUrl && p.imageUrl.startsWith('http') ? (
                                                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : '💊'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{p.name}</div>
                                                    <div className="text-xs text-gray-500">{p.brand}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">{p.categoryName}</td>
                                        <td className="p-4 text-right">
                                            {p.discountPrice ? (
                                                <div>
                                                    <span className="text-green-400 font-medium">${p.discountPrice.toFixed(2)}</span>
                                                    <span className="text-gray-600 line-through text-xs ml-1">${p.price.toFixed(2)}</span>
                                                </div>
                                            ) : <span className="text-gray-300">${p.price?.toFixed(2)}</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`badge ${(p.stock || 0) > 20 ? 'badge-green' : (p.stock || 0) > 0 ? 'badge-amber' : 'badge-red'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">{p.featured ? '⭐' : '—'}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(p)}
                                                    className="px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-xs font-medium transition-all">Edit</button>
                                                <button onClick={() => handleDelete(p.id, p.name)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-all">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-white/5 text-sm text-gray-500">
                        Showing {filtered.length} of {products.length} products
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-6">{editProduct ? '✏️ Edit Product' : '➕ Add Product'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Product Name *</label>
                                    <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Price *</label>
                                    <input type="number" step="0.01" required value={form.price} onChange={e => update('price', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Discount Price</label>
                                    <input type="number" step="0.01" value={form.discountPrice} onChange={e => update('discountPrice', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Brand</label>
                                    <input type="text" value={form.brand} onChange={e => update('brand', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Stock</label>
                                    <input type="number" value={form.stock} onChange={e => update('stock', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Category</label>
                                    <select value={form.categoryId} onChange={e => update('categoryId', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500">
                                        <option value="">Select category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Image URL</label>
                                    <input type="text" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Description</label>
                                    <textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 resize-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Health Goals (comma-separated)</label>
                                    <input type="text" value={form.healthGoals} onChange={e => update('healthGoals', e.target.value)} placeholder="Heart Health,Immunity"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-1">Tags (comma-separated)</label>
                                    <input type="text" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="vitamin-c,organic"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                                <div className="col-span-2 flex items-center gap-3">
                                    <input type="checkbox" id="featured" checked={form.featured} onChange={e => update('featured', e.target.checked)}
                                        className="w-4 h-4 rounded bg-white/5 border-white/10" />
                                    <label htmlFor="featured" className="text-sm text-gray-300">⭐ Mark as Featured</label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="btn-accent flex-1 py-3">{editProduct ? 'Update Product' : 'Create Product'}</button>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1 py-3">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
