import { create } from 'zustand';
import { cartAPI, authAPI, wishlistAPI } from '@/lib/api';

// ===== AUTH STORE =====
interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,

    login: async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, userId, firstName, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(res.data));
        set({ user: res.data, token, isAuthenticated: true });
    },

    register: async (data) => {
        const res = await authAPI.register(data);
        const { token } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(res.data));
        set({ user: res.data, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    loadUser: () => {
        const stored = localStorage.getItem('user');
        if (stored) {
            set({ user: JSON.parse(stored), isAuthenticated: true, token: localStorage.getItem('token') });
        }
    },
}));

// ===== CART STORE =====
interface CartState {
    items: any[];
    loading: boolean;
    coupon: { code: string, discountValue: number, discountType: 'PERCENTAGE' | 'FIXED' } | null;
    fetchCart: () => Promise<void>;
    addToCart: (productId: number, qty?: number) => Promise<void>;
    updateQty: (itemId: number, qty: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    applyCoupon: (coupon: any) => void;
    clearCoupon: () => void;
    getTotal: () => number;
    getDiscount: () => number;
    getFinalTotal: () => number;
    getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,
    coupon: null,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const res = await cartAPI.get();
            set({ items: res.data, loading: false });
        } catch { set({ loading: false }); }
    },

    addToCart: async (productId, qty = 1) => {
        await cartAPI.add(productId, qty);
        await get().fetchCart();
    },

    updateQty: async (itemId, qty) => {
        await cartAPI.update(itemId, qty);
        await get().fetchCart();
    },

    removeItem: async (itemId) => {
        await cartAPI.remove(itemId);
        await get().fetchCart();
    },

    applyCoupon: (coupon) => set({ coupon }),
    clearCoupon: () => set({ coupon: null }),

    getTotal: () => get().items.reduce((sum, i) => sum + (i.totalPrice || 0), 0),
    getDiscount: () => {
        const { coupon, getTotal } = get();
        if (!coupon) return 0;
        if (coupon.discountType === 'FIXED') return coupon.discountValue;
        return (getTotal() * coupon.discountValue) / 100;
    },
    getFinalTotal: () => {
        const total = get().getTotal();
        const discount = get().getDiscount();
        return Math.max(0, total - discount);
    },
    getCount: () => get().items.reduce((sum, i) => sum + (i.quantity || 0), 0),
}));

// ===== WISHLIST STORE =====
interface WishlistState {
    items: any[];
    loading: boolean;
    productIds: Set<number>;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    productIds: new Set<number>(),

    fetchWishlist: async () => {
        set({ loading: true });
        try {
            const res = await wishlistAPI.get();
            const items = res.data || [];
            set({
                items,
                productIds: new Set(items.map((p: any) => p.id)),
                loading: false,
            });
        } catch { set({ loading: false }); }
    },

    addToWishlist: async (productId) => {
        await wishlistAPI.add(productId);
        set(state => ({ productIds: new Set([...Array.from(state.productIds), productId]) }));
        await get().fetchWishlist();
    },

    removeFromWishlist: async (productId) => {
        await wishlistAPI.remove(productId);
        set(state => {
            const newIds = new Set(state.productIds);
            newIds.delete(productId);
            return { productIds: newIds };
        });
        await get().fetchWishlist();
    },

    isInWishlist: (productId) => get().productIds.has(productId),
}));

