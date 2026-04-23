'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productAPI, categoryAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Suspense } from 'react';

function ProductsContent() {
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
        categoryAPI.getAll()
            .then(r => setCategories(r.data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
            .catch(() => { });
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

    const hasActiveFilters = filters.search || filters.categoryId || filters.healthGoal;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <span className="text-xs text-sage font-medium uppercase tracking-widest mb-2 block">Browse</span>
                        <h1 className="text-3xl font-bold text-onSurface">All Products</h1>
                    </div>
                    {!loading && products.length > 0 && (
                        <span className="text-sm text-outline">{products.length} product{products.length !== 1 ? 's' : ''}</span>
                    )}
                </div>
                <p className="text-onSurfaceVar text-sm mt-1">Browse our complete range of health & wellness products</p>
            </div>

            {/* Filters */}
            <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-4 mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search products..." value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value, page: 0 })}
                            className="vc-input pl-9 text-sm" />
                    </div>
                    <select value={filters.categoryId}
                        onChange={e => setFilters({ ...filters, categoryId: e.target.value, page: 0 })}
                        className="vc-input text-sm">
                        <option value="">All Categories</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={filters.healthGoal}
                        onChange={e => setFilters({ ...filters, healthGoal: e.target.value, page: 0 })}
                        className="vc-input text-sm">
                        <option value="">All Health Goals</option>
                        {['Heart Health', 'Immunity', 'Fitness', 'Brain Health', 'Bone Health', 'Weight Loss', 'Skin Health', 'Energy', 'Sleep', 'Diabetes Care', 'Digestive Health', 'Joint Health'].map(g =>
                            <option key={g} value={g}>{g}</option>
                        )}
                    </select>
                    <select value={filters.sortBy}
                        onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
                        className="vc-input text-sm">
                        <option value="newest">Newest</option>
                        <option value="price">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="rating">Top Rated</option>
                        <option value="popularity">Most Popular</option>
                    </select>
                </div>

                {/* Active filter chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outlineVar/15">
                        {filters.search && (
                            <span className="vc-badge vc-badge-sage flex items-center gap-1.5">
                                Search: {filters.search}
                                <button onClick={() => setFilters({ ...filters, search: '', page: 0 })} className="hover:text-onSurface">×</button>
                            </span>
                        )}
                        {filters.categoryId && (
                            <span className="vc-badge vc-badge-stone flex items-center gap-1.5">
                                {categories.find(c => c.id.toString() === filters.categoryId)?.name || 'Category'}
                                <button onClick={() => setFilters({ ...filters, categoryId: '', page: 0 })} className="hover:text-onSurface">×</button>
                            </span>
                        )}
                        {filters.healthGoal && (
                            <span className="vc-badge vc-badge-amber flex items-center gap-1.5">
                                {filters.healthGoal}
                                <button onClick={() => setFilters({ ...filters, healthGoal: '', page: 0 })} className="hover:text-onSurface">×</button>
                            </span>
                        )}
                        <button onClick={() => setFilters({ ...filters, search: '', categoryId: '', healthGoal: '', page: 0 })}
                            className="text-xs text-outline hover:text-onSurfaceVar transition-colors ml-2">Clear All</button>
                    </div>
                )}
            </div>

            {/* Products grid */}
            {loading ? (
                <div className="product-grid">
                    {[...Array(8)].map((_, i) => <div key={i} className="rounded-lg h-80 shimmer" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-vc-surface-high rounded-lg border border-outlineVar/15">
                    <div className="w-14 h-14 rounded-xl bg-sage/10 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-7 h-7 text-sage/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-onSurface mb-2">No products found</h3>
                    <p className="text-onSurfaceVar text-sm">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                    <button disabled={filters.page === 0}
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        className="btn-ghost text-sm disabled:opacity-30">
                        <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Previous
                    </button>
                    <span className="text-sm text-outline px-4">Page {filters.page + 1} of {totalPages}</span>
                    <button disabled={filters.page >= totalPages - 1}
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        className="btn-ghost text-sm disabled:opacity-30">
                        Next
                        <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-20 flex items-center justify-center text-onSurfaceVar">Loading products...</div>}>
            <ProductsContent />
        </Suspense>
    );
}
