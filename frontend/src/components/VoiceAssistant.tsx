'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { aiAPI } from '@/lib/api';
import { Mic, MicOff, X, Volume2, ShoppingCart, Search, MessageCircle, Stethoscope, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export default function VoiceAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [supported, setSupported] = useState(true);
    const [showDetailed, setShowDetailed] = useState(false);
    const recognitionRef = useRef<any>(null);
    const processRef = useRef<(text: string) => void>();

    const processTranscript = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setLoading(true);
        setShowDetailed(false);
        try {
            const res = await aiAPI.voiceIntent(text);
            if (res?.data) {
                setResponse(res.data);
                // Speak the response aloud
                const toSpeak = res.data.spokenResponse;
                if (toSpeak && window.speechSynthesis) {
                    window.speechSynthesis.cancel(); // stop any ongoing speech
                    const utter = new SpeechSynthesisUtterance(toSpeak);
                    utter.rate = 0.95;
                    utter.pitch = 1;
                    window.speechSynthesis.speak(utter);
                }
            } else {
                setResponse({ spokenResponse: 'I received your message but got an empty response. Please try again.', action: 'CHAT' });
            }
        } catch {
            setResponse({
                spokenResponse: 'Sorry, I had trouble connecting to the server. Please check your internet and try again.',
                action: 'CHAT'
            });
        }
        setLoading(false);
    }, []);

    // Keep processRef in sync
    useEffect(() => { processRef.current = processTranscript; }, [processTranscript]);

    useEffect(() => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { setSupported(false); return; }
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
            setTranscript(t);
            if (e.results[0].isFinal) {
                setIsListening(false);
                processRef.current?.(t);
            }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
    }, []);

    const startListening = () => {
        if (!recognitionRef.current) return;
        setTranscript('');
        setResponse(null);
        setShowDetailed(false);
        setIsListening(true);
        window.speechSynthesis?.cancel();
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsListening(false);
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'SEARCH': return <Search size={16} className="text-blue-400" />;
            case 'ADD_TO_CART': return <ShoppingCart size={16} className="text-green-400" />;
            case 'SYMPTOM_CHECK': return <Stethoscope size={16} className="text-amber-400" />;
            default: return <MessageCircle size={16} className="text-purple-400" />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'SEARCH': return 'Product Search';
            case 'ADD_TO_CART': return 'Add to Cart';
            case 'SYMPTOM_CHECK': return 'Health Analysis';
            default: return 'AI Health Chat';
        }
    };

    if (!supported) return null;

    return (
        <>
            {/* Floating Mic Button */}
            <button onClick={() => { setIsOpen(!isOpen); if (!isOpen) { setTranscript(''); setResponse(null); setShowDetailed(false); window.speechSynthesis?.cancel(); } }}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-gray-800 border border-white/10 scale-90'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 scale-100 hover:scale-110 shadow-violet-500/30'
                }`}>
                {isOpen ? <X size={22} className="text-gray-400" /> : <Mic size={22} className="text-white" />}
            </button>

            {/* Voice Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] glass-strong rounded-2xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                        <div className="flex items-center gap-2">
                            <Volume2 size={16} className="text-violet-400" />
                            <h3 className="text-sm font-semibold text-white">Voice Health Assistant</h3>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/20">RAG + GROQ AI</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">Ask me anything about health, supplements, or symptoms</p>
                    </div>

                    <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
                        {/* Mic Button */}
                        <div className="flex flex-col items-center">
                            <button onClick={isListening ? stopListening : startListening} disabled={loading}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isListening
                                    ? 'bg-red-500/20 border-2 border-red-500 animate-pulse shadow-lg shadow-red-500/20'
                                    : loading ? 'bg-gray-700 border-2 border-gray-600'
                                    : 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-500/30 hover:border-violet-400 hover:scale-105'
                                }`}>
                                {loading ? <Loader2 size={28} className="text-gray-400 animate-spin" /> :
                                    isListening ? <MicOff size={28} className="text-red-400" /> :
                                    <Mic size={28} className="text-violet-400" />}
                            </button>
                            <span className="text-[11px] text-gray-500 mt-2">
                                {loading ? 'Thinking with AI...' : isListening ? 'Listening... tap to stop' : 'Tap to speak'}
                            </span>
                            {/* Waveform animation */}
                            {isListening && (
                                <div className="flex items-center gap-1 mt-2 h-6">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className="w-1 bg-violet-400 rounded-full animate-bounce"
                                            style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 80}ms`, animationDuration: '0.6s' }} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Transcript */}
                        {transcript && (
                            <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                                <span className="text-[10px] text-gray-500 block mb-1">You said:</span>
                                <p className="text-sm text-white">{transcript}</p>
                            </div>
                        )}

                        {/* Response */}
                        {response && (
                            <div className="space-y-3">
                                {/* Action badge */}
                                {response.action && (
                                    <div className="flex items-center gap-2">
                                        {getActionIcon(response.action)}
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                                            {getActionLabel(response.action)}
                                        </span>
                                        {response.responseTimeMs && (
                                            <span className="text-[9px] text-gray-600 ml-auto">{(response.responseTimeMs / 1000).toFixed(1)}s</span>
                                        )}
                                    </div>
                                )}

                                {/* Spoken response */}
                                <div className="bg-violet-500/5 rounded-xl px-4 py-3 border border-violet-500/10">
                                    <p className="text-sm text-gray-300 leading-relaxed">{response.spokenResponse}</p>
                                </div>

                                {/* Severity badge for symptom checks */}
                                {response.severity && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                                        response.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                        response.severity === 'moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
                                        <Stethoscope size={12} />
                                        Severity: {response.severity}
                                        {response.severity === 'high' && ' — Please consult a doctor'}
                                    </div>
                                )}

                                {/* Detailed response toggle */}
                                {response.detailedResponse && response.detailedResponse !== response.spokenResponse && (
                                    <button onClick={() => setShowDetailed(!showDetailed)}
                                        className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors">
                                        {showDetailed ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                        {showDetailed ? 'Show less' : 'Show full AI response'}
                                    </button>
                                )}
                                {showDetailed && response.detailedResponse && (
                                    <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 max-h-48 overflow-y-auto">
                                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                                            {response.detailedResponse.replace(/\*\*/g, '').replace(/#+\s/g, '').replace(/- /g, '• ')}
                                        </p>
                                    </div>
                                )}

                                {/* Products */}
                                {response.products && response.products.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-500">Recommended products:</span>
                                        {response.products.slice(0, 3).map((p: any) => (
                                            <a key={p.id} href={`/products/${p.id}`}
                                                className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 border border-white/5 hover:border-violet-500/20 transition-all">
                                                <span className="text-lg">{response.action === 'SYMPTOM_CHECK' ? '💊' : '🧴'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-white truncate">{p.name}</p>
                                                    <p className="text-[10px] text-gray-500">{p.brand} &middot; ${(p.discountPrice || p.price)?.toFixed(2)}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Confirmation for add to cart */}
                                {response.requiresConfirmation && (
                                    <div className="flex gap-2">
                                        <button onClick={() => { if (response.productId) window.location.href = `/products/${response.productId}`; }}
                                            className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/20 hover:bg-green-500/30 transition-all">
                                            View & Add to Cart
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick suggestions (when no response yet) */}
                        {!transcript && !response && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-gray-600">Try saying:</span>
                                {[
                                    'What vitamins should I take for better sleep?',
                                    'I have a headache and feel tired',
                                    'Tell me about omega 3 benefits',
                                    'Search for vitamin D supplements'
                                ].map(s => (
                                    <button key={s} onClick={() => { setTranscript(s); processTranscript(s); }}
                                        className="block w-full text-left text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                                        &quot;{s}&quot;
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
