'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
    Send, Bot, User, Sparkles, ArrowLeft, Trash2,
    AlertTriangle, CheckCircle, Info, Leaf, Zap,
    Brain, BookOpen, ShoppingBag, Clock, Database
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
    sources?: string[];
    responseTimeMs?: number;
    knowledgeChunksUsed?: number;
    isRAG?: boolean;
}

type ChatMode = 'rag' | 'symptom';

export default function AIChatPage() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>('rag');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const ragSuggestions = [
        'What vitamins should I take for energy?',
        'Best supplements for immune support',
        'How to improve sleep quality naturally?',
        'Products for joint pain and inflammation',
        'Tell me about Omega-3 benefits',
        'What helps with stress and anxiety?',
        'Recommend products for heart health',
        'Best supplements for skin and hair',
    ];

    const symptomSuggestions = [
        'I feel tired and low on energy',
        'I have joint pain and stiffness',
        'I want to boost my immunity',
        'I have trouble sleeping at night',
        'I feel stressed and anxious',
        'I want to improve my skin and hair',
        'I need help managing blood sugar',
        'I want to improve my heart health',
    ];

    const suggestions = mode === 'rag' ? ragSuggestions : symptomSuggestions;

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
            if (mode === 'rag') {
                const history = messages
                    .filter(m => m.isRAG !== false)
                    .map(m => ({ role: m.role, content: m.content }));
                const res = await aiAPI.ragChat(q, history);
                if (res?.data) {
                    const data = res.data;
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.message || 'Here are some recommendations:',
                        products: data.suggestedProducts,
                        followUpQuestions: data.followUpQuestions,
                        sources: data.sources,
                        responseTimeMs: data.responseTimeMs,
                        knowledgeChunksUsed: data.knowledgeChunksUsed,
                        isRAG: true,
                    }]);
                }
            } else {
                const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
                const res = await aiAPI.ragSymptoms(q, chatHistory);
                if (res?.data) {
                    const data = res.data;
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: data.analysis || 'Here are some products that may help:',
                        products: data.suggestedProducts,
                        followUpQuestions: data.followUpQuestions,
                        severity: data.severity,
                        lifestyleTips: data.lifestyleTips,
                        identifiedSymptoms: data.identifiedSymptoms,
                        suggestedCategories: data.possibleConditions,
                        isRAG: false,
                        sources: data.sources,
                        responseTimeMs: data.responseTimeMs,
                        knowledgeChunksUsed: data.knowledgeChunksUsed,
                    }]);
                }
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                            <Brain size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                {mode === 'rag' ? 'AI Health Assistant' : 'Symptom Checker'}
                                {mode === 'rag' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-300 border border-primary-500/20 font-semibold">GROQ AI</span>}
                            </h1>
                            <p className="text-xs text-gray-500">
                                {mode === 'rag' ? 'Powered by LLaMA 3.3 70B + RAG Knowledge Base' : 'Groq AI symptom analysis + product matching'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button onClick={() => setMessages([])} className="p-2 text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5" title="Clear chat">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 mb-6">
                <button
                    onClick={() => { setMode('rag'); setMessages([]); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === 'rag'
                        ? 'bg-gradient-to-r from-primary-500/20 to-purple-500/20 text-primary-300 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                        : 'glass text-gray-400 hover:text-white border border-white/5 hover:border-white/10'}`}
                >
                    <Brain size={16} /> RAG AI Chat
                </button>
                <button
                    onClick={() => { setMode('symptom'); setMessages([]); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === 'symptom'
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/10'
                        : 'glass text-gray-400 hover:text-white border border-white/5 hover:border-white/10'}`}
                >
                    <Leaf size={16} /> Symptom Checker
                </button>
            </div>

            {/* Welcome state */}
            {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-primary-500/10 flex items-center justify-center animate-pulse-slow">
                            {mode === 'rag' ? <Brain size={40} className="text-primary-400" /> : <Sparkles size={40} className="text-green-400" />}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Zap size={12} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {mode === 'rag' ? 'AI Health Assistant' : 'Symptom Checker'}
                    </h2>
                    <p className="text-gray-400 max-w-lg mb-3 text-sm">
                        {mode === 'rag'
                            ? 'Ask anything about health, supplements, and wellness. I use real-time data from our product database and medical knowledge to give you personalized answers.'
                            : 'Describe your symptoms and I\'ll analyze them, recommend products, provide lifestyle tips, and assess severity.'}
                    </p>
                    {mode === 'rag' && (
                        <div className="flex items-center gap-4 mb-8 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1"><Database size={12} className="text-primary-400" /> Real-time product data</span>
                            <span className="flex items-center gap-1"><BookOpen size={12} className="text-purple-400" /> Health knowledge base</span>
                            <span className="flex items-center gap-1"><Zap size={12} className="text-amber-400" /> Groq LLM powered</span>
                        </div>
                    )}

                    {/* Quick action cards */}
                    {mode === 'rag' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full mb-6">
                            {[
                                { icon: <ShoppingBag size={18} />, label: 'Product Advice', query: 'What are the best selling supplements?' },
                                { icon: <BookOpen size={18} />, label: 'Health Education', query: 'Tell me about the benefits of Vitamin D' },
                                { icon: <Leaf size={18} />, label: 'Natural Remedies', query: 'Natural supplements for better sleep' },
                                { icon: <Brain size={18} />, label: 'Personalized Tips', query: 'What supplements should a 30 year old take?' },
                            ].map((item, i) => (
                                <button key={i} onClick={() => handleSend(item.query)}
                                    className="glass-light rounded-xl p-4 text-left hover:border-primary-500/20 border border-transparent transition-all group">
                                    <div className="text-primary-400 mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <span className="text-xs font-medium text-gray-300">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
                        {suggestions.map(s => (
                            <button key={s} onClick={() => handleSend(s)}
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
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${i * 50}ms` }}>
                            {msg.role === 'assistant' && (
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${msg.isRAG ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/20' : 'bg-green-500/20'}`}>
                                    {msg.isRAG ? <Brain size={16} className="text-primary-400" /> : <Bot size={16} className="text-green-400" />}
                                </div>
                            )}
                            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'space-y-3'}`}>
                                {msg.role === 'user' ? (
                                    <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 border border-primary-500/20 rounded-2xl rounded-tr-sm px-5 py-3">
                                        <p className="text-white text-sm">{msg.content}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Main message with markdown-like formatting */}
                                        <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5">
                                            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed prose-invert"
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.content
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                        .replace(/\n- /g, '<br/>&#8226; ')
                                                        .replace(/\n\n/g, '<br/><br/>')
                                                }} />
                                            {msg.severity && (
                                                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${getSeverityConfig(msg.severity).bg} ${getSeverityConfig(msg.severity).text}`}>
                                                    {getSeverityConfig(msg.severity).icon}
                                                    {getSeverityConfig(msg.severity).label}
                                                </div>
                                            )}
                                        </div>

                                        {/* RAG metadata badge */}
                                        {msg.isRAG && (msg.responseTimeMs || msg.knowledgeChunksUsed) && (
                                            <div className="flex items-center gap-3 px-1">
                                                {msg.responseTimeMs && (
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                                        <Clock size={10} /> {(msg.responseTimeMs / 1000).toFixed(1)}s
                                                    </span>
                                                )}
                                                {msg.knowledgeChunksUsed && (
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                                        <Database size={10} /> {msg.knowledgeChunksUsed} sources
                                                    </span>
                                                )}
                                            </div>
                                        )}

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
                                                <h4 className="text-xs font-semibold text-white mb-2">Suggested Ingredients</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.suggestedCategories.slice(0, 8).map((c: string) => (
                                                        <span key={c} className="px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded-lg text-[11px] border border-blue-500/20">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Knowledge Sources (RAG) */}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="glass-light rounded-xl p-4 border border-white/5">
                                                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                                    <Database size={12} className="text-primary-400" /> Knowledge Sources
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.sources.slice(0, 5).map((src: string, j: number) => (
                                                        <span key={j} className="px-2.5 py-1 bg-primary-500/10 text-primary-300 rounded-lg text-[10px] border border-primary-500/20">{src}</span>
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
                                                            <span className="text-green-400 mt-0.5">&#8226;</span> {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Products */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-white mb-3 px-1 flex items-center gap-1.5">
                                                    <ShoppingBag size={12} /> Recommended Products ({msg.products.length})
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {msg.products.slice(0, 8).map((p: any) => (
                                                        <ProductCard key={p.id} product={p} />
                                                    ))}
                                                </div>
                                                {msg.products.length > 8 && (
                                                    <p className="text-xs text-primary-400 mt-2 px-1">
                                                        + {msg.products.length - 8} more products available
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Follow-up Questions */}
                                        {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.followUpQuestions.map((q: string, j: number) => (
                                                    <button key={j} onClick={() => handleSend(q)}
                                                        className="text-xs px-3 py-2 rounded-xl glass text-gray-400 hover:text-white hover:border-primary-500/30 border border-white/5 transition-all text-left flex items-center gap-1.5">
                                                        <Sparkles size={10} className="text-primary-400 flex-shrink-0" /> {q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-purple-400" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex gap-3 animate-slide-up">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${mode === 'rag' ? 'bg-gradient-to-br from-primary-500/20 to-purple-500/20' : 'bg-green-500/20'}`}>
                                {mode === 'rag' ? <Brain size={16} className="text-primary-400" /> : <Bot size={16} className="text-green-400" />}
                            </div>
                            <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {mode === 'rag' ? 'Searching knowledge base & generating response...' : 'Analyzing your health query...'}
                                    </span>
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
                        placeholder={mode === 'rag'
                            ? 'Ask about health, supplements, wellness...'
                            : 'Describe your symptoms or health concerns...'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:shadow-lg focus:shadow-primary-500/5 text-sm transition-all" />
                    <button onClick={() => handleSend()} disabled={loading || !query.trim()}
                        className="btn-primary px-5 py-3 rounded-xl disabled:opacity-50 text-sm flex items-center gap-2 min-w-[90px] justify-center">
                        <Send size={14} />
                        Send
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-[10px] text-gray-600">
                        AI analysis is for informational purposes only — consult a doctor for medical advice
                    </p>
                    {mode === 'rag' && (
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                            <Zap size={8} className="text-amber-400" /> Groq LLaMA 3.3 70B
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
