'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI, recommendAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

interface ChatMsg {
    role: 'user' | 'assistant';
    content: string;
    products?: any[];
    followUpQuestions?: string[];
    severity?: string;
    lifestyleTips?: string[];
    identifiedSymptoms?: string[];
    suggestedCategories?: string[];
}

export default function SymptomSearchPage() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        'I feel tired and low on energy',
        'I have joint pain and stiffness',
        'I want to boost my immunity',
        'I have trouble sleeping at night',
        'I feel stressed and anxious',
        'I want to improve my skin and hair',
        'I need help managing blood sugar',
        'I want to improve my heart health',
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (text?: string) => {
        const q = text || query;
        if (!q.trim()) return;

        const userMsg: ChatMsg = { role: 'user', content: q };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            // Try enhanced AI chat first, fallback to legacy symptom search
            const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await aiAPI.chat(q, chatHistory).catch(() => null);
            if (res?.data) {
                const data = res.data;
                const assistantMsg: ChatMsg = {
                    role: 'assistant',
                    content: data.message || 'Here are some products that may help:',
                    products: data.suggestedProducts,
                    followUpQuestions: data.followUpQuestions,
                    severity: data.severity,
                    lifestyleTips: data.lifestyleTips,
                    identifiedSymptoms: data.identifiedSymptoms,
                    suggestedCategories: data.suggestedCategories,
                };
                setMessages(prev => [...prev, assistantMsg]);
            } else {
                // Fallback to legacy API
                const fallback = await recommendAPI.symptoms(q);
                const data = fallback.data;
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.identifiedSymptoms?.length > 0
                        ? `I identified symptoms related to: ${data.identifiedSymptoms.join(', ')}. Here are some recommended products.`
                        : 'Here are some products that may help:',
                    products: data.suggestedProducts,
                    identifiedSymptoms: data.identifiedSymptoms,
                    suggestedCategories: data.suggestedCategories,
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I had trouble processing your request. Please try again.',
            }]);
        }
        setLoading(false);
    };

    const severityBadge = (severity: string) => {
        const map: Record<string, { bg: string; text: string; label: string }> = {
            'mild': { bg: 'bg-green-500/10', text: 'text-green-400', label: '🟢 Mild — Supplements may help' },
            'moderate': { bg: 'bg-amber-500/10', text: 'text-amber-400', label: '🟡 Moderate — Consider consulting a doctor' },
            'consult-doctor': { bg: 'bg-red-500/10', text: 'text-red-400', label: '🔴 Please consult a healthcare provider' },
        };
        const s = map[severity] || map['mild'];
        return <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</div>;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
            {/* Header — only shown when no messages */}
            {messages.length === 0 && (
                <div className="text-center mb-8 pt-8">
                    <span className="text-6xl block mb-4 animate-float">🤖</span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">AI Health Assistant</h1>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Describe your symptoms or health concerns. I&apos;ll analyze them and recommend the right products, provide lifestyle tips, and assess severity.
                    </p>

                    {/* Suggestion chips */}
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                        {suggestions.map(s => (
                            <button key={s} onClick={() => { setQuery(s); handleSend(s); }}
                                className="text-sm px-4 py-2 rounded-full glass-light text-gray-400 hover:text-white hover:border-primary-500 transition-all border border-transparent">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 space-y-6 mb-6 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user'
                            ? 'bg-primary-600/20 border border-primary-500/20 rounded-2xl rounded-tr-sm px-5 py-3'
                            : 'space-y-4'
                            }`}>
                            {msg.role === 'user' ? (
                                <p className="text-white text-sm">{msg.content}</p>
                            ) : (
                                <>
                                    {/* AI Message Bubble */}
                                    <div className="glass rounded-2xl rounded-tl-sm px-5 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">🤖</span>
                                            <span className="text-xs text-gray-500 font-medium">AI Health Assistant</span>
                                        </div>
                                        <p className="text-sm text-gray-300 whitespace-pre-line">{msg.content}</p>

                                        {/* Severity Badge */}
                                        {msg.severity && (
                                            <div className="mt-3">{severityBadge(msg.severity)}</div>
                                        )}
                                    </div>

                                    {/* Identified Symptoms */}
                                    {msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0 && (
                                        <div className="glass-light rounded-xl p-4">
                                            <h4 className="text-xs font-semibold text-white mb-2">🔍 Identified Symptoms</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {msg.identifiedSymptoms.map((s: string) => (
                                                    <span key={s} className="badge badge-purple text-[10px] capitalize">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Suggested Categories */}
                                    {msg.suggestedCategories && msg.suggestedCategories.length > 0 && (
                                        <div className="glass-light rounded-xl p-4">
                                            <h4 className="text-xs font-semibold text-white mb-2">💡 Suggested Ingredients</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {msg.suggestedCategories.slice(0, 8).map((c: string) => (
                                                    <span key={c} className="badge badge-blue text-[10px]">{c}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Lifestyle Tips */}
                                    {msg.lifestyleTips && msg.lifestyleTips.length > 0 && (
                                        <div className="glass-light rounded-xl p-4">
                                            <h4 className="text-xs font-semibold text-white mb-2">🌿 Lifestyle Tips</h4>
                                            <ul className="space-y-1.5">
                                                {msg.lifestyleTips.map((tip: string, j: number) => (
                                                    <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                                        <span className="text-green-400 mt-0.5">•</span> {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Products */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-white mb-3 px-1">🛍️ Recommended Products ({msg.products.length})</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {msg.products.slice(0, 6).map((p: any) => (
                                                    <ProductCard key={p.id} product={p} />
                                                ))}
                                            </div>
                                            {msg.products.length > 6 && (
                                                <p className="text-xs text-primary-400 mt-2">
                                                    + {msg.products.length - 6} more products available
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Follow-up Questions */}
                                    {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {msg.followUpQuestions.map((q: string, j: number) => (
                                                <button key={j} onClick={() => { setQuery(q); handleSend(q); }}
                                                    className="text-xs px-3 py-2 rounded-xl glass-light text-gray-400 hover:text-white hover:border-primary-500/30 border border-transparent transition-all text-left">
                                                    💬 {q}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="glass rounded-2xl rounded-tl-sm px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-gray-500">Analyzing your symptoms...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Bar — sticky at bottom */}
            <div className="sticky bottom-0 glass-strong rounded-2xl p-4 border border-white/5">
                <div className="flex gap-3">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder={messages.length === 0 ? 'Describe your symptoms or health concerns...' : 'Ask a follow-up question...'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 text-sm" />
                    <button onClick={() => handleSend()} disabled={loading || !query.trim()}
                        className="btn-accent px-6 py-3 rounded-xl disabled:opacity-50 text-sm">
                        {loading ? '⏳' : '🔬'} Send
                    </button>
                </div>
                {messages.length > 0 && (
                    <div className="flex items-center justify-between mt-2 px-1">
                        <p className="text-[10px] text-gray-600">⚠️ AI analysis is for informational purposes only — consult a doctor for medical advice</p>
                        <button onClick={() => setMessages([])} className="text-[10px] text-gray-600 hover:text-gray-400">Clear chat</button>
                    </div>
                )}
            </div>
        </div>
    );
}
