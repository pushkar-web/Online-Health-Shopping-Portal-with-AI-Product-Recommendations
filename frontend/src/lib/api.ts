import axios from 'axios';

// In production (Vercel HTTPS), use relative URLs so Next.js rewrites proxy to backend.
// This avoids HTTPS->HTTP mixed content blocking by browsers.
// In development, call backend directly on localhost.
const API_BASE = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
    : '';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(err);
    }
);

// Auth
export const authAPI = {
    register: (data: any) => api.post('/api/auth/register', data),
    login: (data: any) => api.post('/api/auth/login', data),
    me: () => api.get('/api/auth/me'),
};

// Products
export const productAPI = {
    getAll: (params?: any) => api.get('/api/products', { params }),
    getById: (id: number) => api.get(`/api/products/${id}`),
    getFeatured: () => api.get('/api/products/featured'),
    getTrending: () => api.get('/api/products/trending'),
    getNewArrivals: () => api.get('/api/products/new-arrivals'),
    getByHealthGoal: (goal: string) => api.get(`/api/products/health-goal/${goal}`),
};

// Categories
export const categoryAPI = {
    getAll: () => api.get('/api/categories'),
};

// Cart
export const cartAPI = {
    get: () => api.get('/api/cart'),
    add: (productId: number, quantity: number) => api.post('/api/cart', { productId, quantity }),
    update: (itemId: number, quantity: number) => api.put(`/api/cart/${itemId}?quantity=${quantity}`),
    remove: (itemId: number) => api.delete(`/api/cart/${itemId}`),
};

// Orders
export const orderAPI = {
    create: (data: any) => api.post('/api/orders', data),
    history: (page = 0, size = 10) => api.get(`/api/orders/history?page=${page}&size=${size}`),
};

// Reviews
export const reviewAPI = {
    getByProduct: (productId: number, page = 0) => api.get(`/api/reviews/product/${productId}?page=${page}`),
    create: (data: any) => api.post('/api/reviews', data),
};

// Recommendations
export const recommendAPI = {
    get: (userId: number) => api.get(`/api/recommendations/${userId}`),
    fbt: (productId: number) => api.get(`/api/recommendations/product/${productId}/frequently-bought-together`),
    symptoms: (desc: string) => api.post('/api/chat/symptoms', { symptomDescription: desc }),
};

// AI Features
export const aiAPI = {
    // Health Score
    healthScore: () => api.get('/api/ai/health-score'),
    // Drug Interaction Checker
    checkInteractions: (productIds: number[], medications: string[]) =>
        api.post('/api/ai/interaction-check', { productIds, currentMedications: medications }),
    // Smart Product Comparison
    compareProducts: (productIds: number[]) =>
        api.post('/api/ai/compare', { productIds }),
    // Personalized Dosage
    getDosage: (productId: number) => api.get(`/api/ai/dosage/${productId}`),
    // Purchase Pattern Insights
    purchaseInsights: () => api.get('/api/ai/purchase-insights'),
    // Full Health Insights Dashboard
    healthInsights: () => api.get('/api/ai/health-insights'),
    // Nutrition Gap Analysis
    nutritionGaps: () => api.get('/api/ai/nutrition-gaps'),
    // Daily Health Tips
    dailyTips: () => api.get('/api/ai/daily-tips'),
    // Enhanced AI Chat (rule-based)
    chat: (message: string, history?: any[]) =>
        api.post('/api/ai/chat', { message, history }),
    // RAG Agent (Groq LLM-powered)
    ragChat: (message: string, history?: { role: string; content: string }[]) =>
        api.post('/api/ai/rag/chat', { message, history }),
    ragQuick: (query: string) =>
        api.post('/api/ai/rag/quick', { query }),
    ragRecommend: (healthConcern: string) =>
        api.post('/api/ai/rag/recommend', { healthConcern }),
    ragEducate: (topic: string) =>
        api.post('/api/ai/rag/educate', { topic }),
    ragSymptoms: (symptoms: string, history?: { role: string; content: string }[]) =>
        api.post('/api/ai/rag/symptoms', { symptoms, history }),
    ragStats: () => api.get('/api/ai/rag/stats'),
    // Voice Assistant
    voiceIntent: (transcript: string) =>
        api.post('/api/ai/voice/intent', { transcript }),
    // Supplement Scanner
    scanAnalyze: (ocrText: string, userAllergies?: string[]) =>
        api.post('/api/ai/scan/analyze', { ocrText, userAllergies }),
    // Health Shield
    healthShield: () => api.get('/api/ai/health-shield'),
    // Health Literacy Hub
    learnTopics: () => api.get('/api/ai/learn/topics'),
    learnLesson: (topicId: string, level?: string) =>
        api.get(`/api/ai/learn/lesson/${topicId}${level ? `?level=${level}` : ''}`),
    learnQuizSubmit: (topicId: string, answers: number[]) =>
        api.post('/api/ai/learn/quiz/submit', { topicId, answers }),
};

// Challenges
export const challengeAPI = {
    getAll: () => api.get('/api/challenges'),
    join: (id: number) => api.post(`/api/challenges/${id}/join`),
    getProgress: (id: number) => api.get(`/api/challenges/${id}/my-progress`),
    completeTask: (id: number) => api.post(`/api/challenges/${id}/complete-task`),
    getLeaderboard: (id: number) => api.get(`/api/challenges/${id}/leaderboard`),
};

// Health Profile
export const profileAPI = {
    get: () => api.get('/api/user/health-profile'),
    update: (data: any) => api.put('/api/user/health-profile', data),
};

// Wishlist
export const wishlistAPI = {
    get: () => api.get('/api/wishlist'),
    add: (productId: number) => api.post(`/api/wishlist/${productId}`),
    remove: (productId: number) => api.delete(`/api/wishlist/${productId}`),
    check: (productId: number) => api.get(`/api/wishlist/check/${productId}`),
};

// Admin
export const adminAPI = {
    getStats: () => api.get('/api/admin/stats'),
    getAIStats: () => api.get('/api/ai/admin/stats'),
    createProduct: (data: any) => api.post('/api/admin/products', data),
    updateProduct: (id: number, data: any) => api.put(`/api/admin/products/${id}`, data),
    deleteProduct: (id: number) => api.delete(`/api/admin/products/${id}`),

    // Orders
    getAllOrders: (page = 0, size = 10) => api.get(`/api/admin/orders?page=${page}&size=${size}`),
    updateOrderStatus: (id: number, status: string) => api.put(`/api/admin/orders/${id}/status?status=${status}`),

    // Users
    getAllUsers: () => api.get('/api/admin/users'),

    // Coupons
    getAllCoupons: () => api.get('/api/admin/coupons'),
    createCoupon: (data: any) => api.post('/api/admin/coupons', data),
    deleteCoupon: (id: number) => api.delete(`/api/admin/coupons/${id}`),
};

export const couponAPI = {
    validate: (code: string, amount: number) => api.post('/api/coupons/validate', { code, amount }),
};

export default api;
