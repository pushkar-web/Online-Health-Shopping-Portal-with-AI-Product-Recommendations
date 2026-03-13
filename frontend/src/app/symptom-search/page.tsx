'use client';
import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
    Send, Stethoscope, User, Sparkles, ArrowLeft, Trash2, RotateCcw,
    AlertTriangle, CheckCircle, AlertCircle, Shield, Leaf, Apple,
    Heart, Brain, Activity, Clock, Database, ChevronRight, Flame,
    Eye, Moon, Dumbbell, Pill, ShoppingBag, MessageCircle, Zap
} from 'lucide-react';

interface SymptomMsg {
    role: 'user' | 'assistant';
    content: string;
    analysis?: string;
    severity?: string;
    identifiedSymptoms?: string[];
    possibleConditions?: string[];
    lifestyleTips?: string[];
    dietaryRecommendations?: string[];
    whenToSeeDoctor?: string;
    products?: any[];
    followUpQuestions?: string[];
    sources?: string[];
    responseTimeMs?: number;
    knowledgeChunksUsed?: number;
}

const BODY_AREAS = [
    { id: 'head', label: 'Head & Mind', icon: Brain, color: 'from-purple-500 to-indigo-500', queries: ['I have a headache', 'I feel dizzy and lightheaded', 'I have brain fog and trouble concentrating'] },
    { id: 'chest', label: 'Heart & Chest', icon: Heart, color: 'from-red-500 to-pink-500', queries: ['I have chest tightness', 'My heart rate feels irregular', 'I get short of breath easily'] },
    { id: 'stomach', label: 'Digestive', icon: Flame, color: 'from-orange-500 to-amber-500', queries: ['I have stomach pain and bloating', 'I feel nauseous after eating', 'I have constipation and digestive issues'] },
    { id: 'energy', label: 'Energy & Sleep', icon: Moon, color: 'from-blue-500 to-cyan-500', queries: ['I feel extremely tired all the time', 'I have trouble falling asleep', 'I wake up feeling unrefreshed'] },
    { id: 'muscles', label: 'Muscles & Joints', icon: Dumbbell, color: 'from-emerald-500 to-green-500', queries: ['I have joint pain and stiffness', 'My muscles ache and feel weak', 'I have back pain that won\'t go away'] },
    { id: 'skin', label: 'Skin & Hair', icon: Eye, color: 'from-pink-500 to-rose-500', queries: ['My skin is dry and breaking out', 'I\'m losing hair and it feels thin', 'I have dark circles and dull skin'] },
    { id: 'immunity', label: 'Immunity', icon: Shield, color: 'from-teal-500 to-emerald-500', queries: ['I keep getting sick frequently', 'I want to boost my immune system', 'I have a persistent cold and cough'] },
    { id: 'mood', label: 'Mood & Stress', icon: Activity, color: 'from-violet-500 to-purple-500', queries: ['I feel stressed and overwhelmed', 'I have anxiety and nervousness', 'I feel down and unmotivated'] },
];

export default function SymptomCheckerPage() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<SymptomMsg[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedArea, setSelectedArea] = useState<string | null>(null);
    const [showAreas, setShowAreas] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (text?: string) => {
        const q = text || query;
        if (!q.trim()) return;

        const userMsg: SymptomMsg = { role: 'user', content: q };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);
        setShowAreas(false);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const res = await aiAPI.ragSymptoms(q, history);
            if (res?.data) {
                const d = res.data;
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: d.analysis || 'Let me analyze your symptoms...',
                    analysis: d.analysis,
                    severity: d.severity,
                    identifiedSymptoms: d.identifiedSymptoms,
                    possibleConditions: d.possibleConditions,
                    lifestyleTips: d.lifestyleTips,
                    dietaryRecommendations: d.dietaryRecommendations,
                    whenToSeeDoctor: d.whenToSeeDoctor,
                    products: d.suggestedProducts,
                    followUpQuestions: d.followUpQuestions,
                    sources: d.sources,
                    responseTimeMs: d.responseTimeMs,
                    knowledgeChunksUsed: d.knowledgeChunksUsed,
                }]);
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I had trouble analyzing your symptoms. Please try describing them again.',
            }]);
        }
        setLoading(false);
    };

    const clearChat = () => {
        setMessages([]);
        setSelectedArea(null);
        setShowAreas(true);
    };

    const getSeverityConfig = (severity: string) => {
        const map: Record<string, { gradient: string; bg: string; border: string; text: string; icon: any; label: string; sublabel: string }> = {
            'mild': {
                gradient: 'from-emerald-500 to-green-500',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                text: 'text-emerald-400',
                icon: <CheckCircle size={18} />,
                label: 'Mild',
                sublabel: 'Manageable with supplements and lifestyle changes'
            },
            'moderate': {
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/30',
                text: 'text-amber-400',
                icon: <AlertCircle size={18} />,
                label: 'Moderate',
                sublabel: 'Consider consulting a doctor if symptoms persist'
            },
            'severe': {
                gradient: 'from-red-500 to-rose-500',
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                text: 'text-red-400',
                icon: <AlertTriangle size={18} />,
                label: 'Seek Medical Attention',
                sublabel: 'Please consult a healthcare provider promptly'
            },
        };
        return map[severity] || map['mild'];
    };

    const selectedAreaData = BODY_AREAS.find(a => a.id === selectedArea);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Stethoscope size={22} className="text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-[#0a0f1e]">
                                <Zap size={8} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                AI Symptom Analyzer
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/20 font-semibold">GROQ AI</span>
                            </h1>
                            <p className="text-xs text-gray-500">Powered by LLaMA 3.3 70B + RAG Knowledge Base (10,000+ health products)</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5 text-xs">
                            <RotateCcw size={12} /> New Analysis
                        </button>
                    )}
                </div>
            </div>

            {/* Welcome / Body Area Selection */}
            {showAreas && messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center pb-4">
                    {/* Hero */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/10 flex items-center justify-center">
                                <Stethoscope size={36} className="text-teal-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
                                <Brain size={14} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">What symptoms are you experiencing?</h2>
                        <p className="text-gray-400 text-sm max-w-lg mx-auto">
                            Select a body area below or describe your symptoms directly. Our AI will analyze them using 10,000+ health products and medical knowledge.
                        </p>
                    </div>

                    {/* Body Area Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full mb-8">
                        {BODY_AREAS.map((area) => {
                            const Icon = area.icon;
                            const isSelected = selectedArea === area.id;
                            return (
                                <button key={area.id}
                                    onClick={() => setSelectedArea(isSelected ? null : area.id)}
                                    className={`relative rounded-xl p-4 text-left transition-all duration-300 border group ${isSelected
                                        ? `bg-gradient-to-br ${area.color} bg-opacity-10 border-white/20 shadow-lg scale-[1.02]`
                                        : 'glass border-white/5 hover:border-white/15 hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all ${isSelected
                                        ? 'bg-white/20'
                                        : `bg-gradient-to-br ${area.color} bg-opacity-20`
                                    }`}>
                                        <Icon size={20} className={isSelected ? 'text-white' : 'text-white/80'} />
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {area.label}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick symptom suggestions based on selected area */}
                    {selectedAreaData && (
                        <div className="w-full max-w-3xl animate-slide-up">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <MessageCircle size={14} className="text-teal-400" />
                                <span className="text-xs font-medium text-gray-400">Common {selectedAreaData.label} symptoms — click to analyze</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {selectedAreaData.queries.map((q, i) => (
                                    <button key={i} onClick={() => handleSend(q)}
                                        className="flex items-center gap-3 w-full text-left px-5 py-3.5 rounded-xl glass border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedAreaData.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                            <Sparkles size={14} className="text-white/80" />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white flex-1">{q}</span>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-teal-400 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* "Or type anything" */}
                    {!selectedArea && (
                        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
                            {[
                                'I feel tired and low on energy',
                                'I have joint pain and stiffness',
                                'I want to boost my immunity',
                                'I have trouble sleeping at night',
                                'I feel stressed and anxious',
                                'I need help managing blood sugar',
                            ].map(s => (
                                <button key={s} onClick={() => handleSend(s)}
                                    className="text-xs px-4 py-2.5 rounded-xl glass text-gray-400 hover:text-white hover:border-teal-500/30 transition-all border border-white/5">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
                <div className="flex-1 space-y-5 mb-4 overflow-y-auto pr-1">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${i * 40}ms` }}>
                            {msg.role === 'assistant' && (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Stethoscope size={16} className="text-teal-400" />
                                </div>
                            )}
                            <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-3'}`}>
                                {msg.role === 'user' ? (
                                    <div className="bg-gradient-to-r from-teal-600/20 to-emerald-600/20 border border-teal-500/20 rounded-2xl rounded-tr-sm px-5 py-3">
                                        <p className="text-white text-sm">{msg.content}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Severity Banner */}
                                        {msg.severity && (
                                            <div className={`rounded-xl p-4 border ${getSeverityConfig(msg.severity).bg} ${getSeverityConfig(msg.severity).border}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSeverityConfig(msg.severity).gradient} flex items-center justify-center`}>
                                                        {getSeverityConfig(msg.severity).icon}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold ${getSeverityConfig(msg.severity).text}`}>
                                                            {getSeverityConfig(msg.severity).label}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {getSeverityConfig(msg.severity).sublabel}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Analysis Text */}
                                        <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5">
                                            <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: (msg.analysis || msg.content)
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                        .replace(/\n- /g, '<br/>&#8226; ')
                                                        .replace(/\n\n/g, '<br/><br/>')
                                                }} />
                                        </div>

                                        {/* Response metadata */}
                                        {(msg.responseTimeMs || msg.knowledgeChunksUsed) && (
                                            <div className="flex items-center gap-3 px-1">
                                                {msg.responseTimeMs && (
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                                        <Clock size={10} /> {(msg.responseTimeMs / 1000).toFixed(1)}s
                                                    </span>
                                                )}
                                                {msg.knowledgeChunksUsed && (
                                                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                                        <Database size={10} /> {msg.knowledgeChunksUsed} knowledge sources
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                                                    <Zap size={10} className="text-amber-500" /> Groq LLaMA 3.3
                                                </span>
                                            </div>
                                        )}

                                        {/* Identified Symptoms + Possible Conditions Row */}
                                        {((msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0) || (msg.possibleConditions && msg.possibleConditions.length > 0)) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {msg.identifiedSymptoms && msg.identifiedSymptoms.length > 0 && (
                                                    <div className="glass-light rounded-xl p-4 border border-white/5">
                                                        <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                                                            <Activity size={12} className="text-teal-400" /> Identified Symptoms
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {msg.identifiedSymptoms.map((s: string, j: number) => (
                                                                <span key={j} className="px-2.5 py-1 bg-teal-500/10 text-teal-300 rounded-lg text-[11px] border border-teal-500/20 capitalize">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.possibleConditions && msg.possibleConditions.length > 0 && (
                                                    <div className="glass-light rounded-xl p-4 border border-white/5">
                                                        <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                                                            <AlertCircle size={12} className="text-amber-400" /> Possible Related Conditions
                                                        </h4>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {msg.possibleConditions.map((c: string, j: number) => (
                                                                <span key={j} className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-[11px] border border-amber-500/20">{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Lifestyle Tips + Dietary Recommendations Row */}
                                        {((msg.lifestyleTips && msg.lifestyleTips.length > 0) || (msg.dietaryRecommendations && msg.dietaryRecommendations.length > 0)) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {msg.lifestyleTips && msg.lifestyleTips.length > 0 && (
                                                    <div className="glass-light rounded-xl p-4 border border-white/5">
                                                        <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                                                            <Leaf size={12} className="text-green-400" /> Lifestyle Tips
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {msg.lifestyleTips.map((tip: string, j: number) => (
                                                                <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                                                    <span className="w-5 h-5 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <CheckCircle size={10} className="text-green-400" />
                                                                    </span>
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {msg.dietaryRecommendations && msg.dietaryRecommendations.length > 0 && (
                                                    <div className="glass-light rounded-xl p-4 border border-white/5">
                                                        <h4 className="text-xs font-semibold text-white mb-2.5 flex items-center gap-1.5">
                                                            <Apple size={12} className="text-red-400" /> Dietary Recommendations
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {msg.dietaryRecommendations.map((rec: string, j: number) => (
                                                                <li key={j} className="text-xs text-gray-400 flex items-start gap-2">
                                                                    <span className="w-5 h-5 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                        <Apple size={10} className="text-red-400" />
                                                                    </span>
                                                                    {rec}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* When to See Doctor */}
                                        {msg.whenToSeeDoctor && (
                                            <div className="glass-light rounded-xl p-4 border border-white/5 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                                                <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                                                    <Stethoscope size={12} className="text-blue-400" /> When to See a Doctor
                                                </h4>
                                                <p className="text-xs text-gray-400 leading-relaxed">{msg.whenToSeeDoctor}</p>
                                            </div>
                                        )}

                                        {/* Knowledge Sources */}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 px-1">
                                                <span className="text-[10px] text-gray-600 mr-1 flex items-center gap-1"><Database size={10} /> Sources:</span>
                                                {msg.sources.slice(0, 5).map((src: string, j: number) => (
                                                    <span key={j} className="px-2 py-0.5 bg-white/5 text-gray-500 rounded text-[10px] border border-white/5">{src}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Recommended Products */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-white mb-3 px-1 flex items-center gap-1.5">
                                                    <ShoppingBag size={12} className="text-teal-400" /> Recommended Supplements ({msg.products.length})
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {msg.products.slice(0, 8).map((p: any) => (
                                                        <ProductCard key={p.id} product={p} />
                                                    ))}
                                                </div>
                                                {msg.products.length > 8 && (
                                                    <p className="text-xs text-teal-400 mt-2 px-1">
                                                        + {msg.products.length - 8} more products
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Follow-up Questions */}
                                        {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.followUpQuestions.map((q: string, j: number) => (
                                                    <button key={j} onClick={() => handleSend(q)}
                                                        className="text-xs px-3.5 py-2.5 rounded-xl glass text-gray-400 hover:text-white hover:border-teal-500/30 border border-white/5 transition-all text-left flex items-center gap-1.5 group">
                                                        <Sparkles size={10} className="text-teal-400 flex-shrink-0 group-hover:animate-spin" /> {q}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-teal-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex gap-3 animate-slide-up">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <Stethoscope size={16} className="text-teal-400 animate-pulse" />
                            </div>
                            <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 border border-white/5 max-w-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-gray-500">Analyzing symptoms with AI...</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                        <Database size={10} className="text-teal-500" /> Searching knowledge base...
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                        <Brain size={10} className="text-purple-500" /> Running LLM analysis...
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                        <Pill size={10} className="text-blue-500" /> Matching supplements...
                                    </div>
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
                        placeholder={messages.length === 0
                            ? 'Describe your symptoms in detail...'
                            : 'Ask a follow-up question or describe more symptoms...'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500/50 focus:shadow-lg focus:shadow-teal-500/5 text-sm transition-all" />
                    <button onClick={() => handleSend()} disabled={loading || !query.trim()}
                        className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white px-5 py-3 rounded-xl disabled:opacity-50 text-sm flex items-center gap-2 min-w-[100px] justify-center font-medium transition-all shadow-lg shadow-teal-500/20 disabled:shadow-none">
                        <Send size={14} />
                        Analyze
                    </button>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                    <p className="text-[10px] text-gray-600">
                        AI symptom analysis is for informational purposes only — always consult a healthcare professional for medical advice
                    </p>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <Zap size={8} className="text-amber-400" /> Groq LLaMA 3.3 70B + RAG
                    </span>
                </div>
            </div>
        </div>
    );
}
