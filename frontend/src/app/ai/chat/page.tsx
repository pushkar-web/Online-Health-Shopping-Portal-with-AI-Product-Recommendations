'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI, recommendAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
    Send, Bot, User, Sparkles, ArrowLeft, Trash2,
    AlertTriangle, CheckCircle, Info, Leaf
} from 'lucide-react';

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

export default function AIChatPage() {
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

    const getSeverityConfig = (severity: string) => {
        const map: Record<string, { bg: string; text: string; icon: any; label: string }> = {
            'mild': { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', icon: <CheckCircle size={14} />, label: 'Mild — Supplements may help' },
            'moderate': { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: <Info size={14} />, label: 'Moderate — Consider consulting a doctor' },
            'consult-doctor': { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: <AlertTriangle size={14} />, label: 'Please consult a healthcare provider' },
        };
        return map[severity] || map['mild'];
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/recommendations" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bot size={22} className="text-primary-400" /> AI Health Chat
                        </h1>
                        <p className="text-xs text-gray-500">Describe symptoms • Get product recommendations • Lifestyle tips</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button onClick={() => setMessages([])} className="p-2 text-gray-500 hover:text-gray-300 transition-colors" title="Clear chat">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Welcome state */}
            {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/10 flex items-center justify-center">
                        <Sparkles size={32} className="text-primary-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">AI Health Assistant</h2>
                    <p className="text-gray-400 max-w-md mb-8 text-sm">
                        Describe your symptoms or health concerns. I&apos;ll analyze them, recommend products, provide lifestyle tips, and assess severity.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                        {suggestions.map(s => (
                            <button key={s} onClick={() => { setQuery(s); handleSend(s); }}
                                className="text-sm px-4 py-2.5 rounded-xl glass text-gray-400 hover:text-white hover:border-primary-500/30 transition-all border border-white/5">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
                <div className="flex-1 space-y-5 mb-4 overflow-y-auto pr-1">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={16} className="text-primary-400" />
                                </div>
                            )}
                            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'space-y-3'}`}>
                                {msg.role === 'user' ? (
                                    <div className="bg-primary-600/20 border border-primary-500/20 rounded-2xl rounded-tr-sm px-5 py-3">
                                        <p className="text-white text-sm">{msg.content}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Main message */}
                                        <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5">
                                            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{msg.content}</p>
                                            {msg.severity && (
                                                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getSeverityConfig(msg.severity).bg} ${getSeverityConfig(msg.severity).text}`}>
                                                    {getSeverityConfig(msg.severity).icon}
                                                    {getSeverityConfig(msg.severity).label}
                                                </div>
                                            )}
                                        </div>

                                        {/* Identified Symptoms */}
                                        {msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0 && (
                                            <div className="glass-light rounded-xl p-4 border border-white/5">
                                                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                                    <Info size={12} /> Identified Symptoms
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.identifiedSymptoms.map((s: string) => (
                                                        <span key={s} className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded-lg text-[11px] border border-purple-500/20 capitalize">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggested Categories */}
                                        {msg.suggestedCategories && msg.suggestedCategories.length > 0 && (
                                            <div className="glass-light rounded-xl p-4 border border-white/5">
                                                <h4 className="text-xs font-semibold text-white mb-2">💡 Suggested Ingredients</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.suggestedCategories.slice(0, 8).map((c: string) => (
                                                        <span key={c} className="px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-[11px] border border-blue-500/20">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Lifestyle Tips */}
                                        {msg.lifestyleTips && msg.lifestyleTips.length > 0 && (
                                            <div className="glass-light rounded-xl p-4 border border-white/5">
                                                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                                    <Leaf size={12} className="text-green-400" /> Lifestyle Tips
                                                </h4>
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
                                                    <p className="text-xs text-primary-400 mt-2 px-1">
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
                                                        className="text-xs px-3 py-2 rounded-xl glass text-gray-400 hover:text-white hover:border-primary-500/30 border border-white/5 transition-all text-left">
                                                        💬 {q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-purple-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                <Bot size={16} className="text-primary-400" />
                            </div>
                            <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-gray-500">Analyzing your health query...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>
            )}

            {/* Input Bar */}
            <div className="sticky bottom-0 glass-strong rounded-2xl p-4 border border-white/5 mt-auto">
                <div className="flex gap-3">
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder={messages.length === 0 ? 'Describe your symptoms or health concerns...' : 'Ask a follow-up question...'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500 text-sm transition-colors" />
                    <button onClick={() => handleSend()} disabled={loading || !query.trim()}
                        className="btn-accent px-5 py-3 rounded-xl disabled:opacity-50 text-sm flex items-center gap-2">
                        <Send size={14} />
                        Send
                    </button>
                </div>
                {messages.length > 0 && (
                    <p className="text-[10px] text-gray-600 mt-2 px-1">
                        ⚠️ AI analysis is for informational purposes only — consult a doctor for medical advice
                    </p>
                )}
            </div>
        </div>
    );
}
