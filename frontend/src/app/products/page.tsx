'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productAPI, categoryAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        categoryId: searchParams.get('categoryId') || '',
        healthGoal: searchParams.get('healthGoal') || '',
        sortBy: 'newest',
        page: 0,
        size: 12,
    });

    useEffect(() => {
        categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: any = { ...filters };
        Object.keys(params).forEach(k => { if (!params[k] && params[k] !== 0) delete params[k]; });
        productAPI.getAll(params).then(r => {
            setProducts(r.data.content || r.data || []);
            setTotalPages(r.data.totalPages || 1);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [filters]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-white">All Products</h1>
                {!loading && products.length > 0 && (
                    <span className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''} found</span>
                )}
            </div>
            <p className="text-gray-400 mb-8">Browse our complete range of 180+ health products</p>

            {/* Filters */}
            <div className="glass-light rounded-xl p-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input type="text" placeholder="Search products..." value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value, page: 0 })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500" />
                    <select value={filters.categoryId}
                        onChange={e => setFilters({ ...filters, categoryId: e.target.value, page: 0 })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500">
                        <option value="">All Categories</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={filters.healthGoal}
                        onChange={e => setFilters({ ...filters, healthGoal: e.target.value, page: 0 })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500">
                        <option value="">All Health Goals</option>
                        {['Heart Health', 'Immunity', 'Fitness', 'Brain Health', 'Bone Health', 'Weight Loss', 'Skin Health', 'Energy', 'Sleep', 'Diabetes Care', 'Digestive Health', 'Joint Health'].map(g =>
                            <option key={g} value={g}>{g}</option>
                        )}
                    </select>
                    <select value={filters.sortBy}
                        onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500">
                        <option value="newest">Newest</option>
                        <option value="price">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="popularity">Most Popular</option>
                    </select>
                </div>
            </div>

            {/* Products grid */}
            {loading ? (
                <div className="product-grid">
                    {[...Array(8)].map((_, i) => <div key={i} className="rounded-xl h-80 shimmer" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <span className="text-5xl block mb-4">🔍</span>
                    <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                    <p className="text-gray-400">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={filters.page === 0}
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        className="px-4 py-2 rounded-lg glass-light text-sm text-gray-400 hover:text-white disabled:opacity-40">← Prev</button>
                    <span className="text-sm text-gray-400">Page {filters.page + 1} of {totalPages}</span>
                    <button disabled={filters.page >= totalPages - 1}
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        className="px-4 py-2 rounded-lg glass-light text-sm text-gray-400 hover:text-white disabled:opacity-40">Next →</button>
                </div>
            )}
        </div>
    );
}
