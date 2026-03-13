'use client';
import { useState, useRef } from 'react';
import { aiAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ArrowLeft, Camera, Upload, Loader2, Shield, AlertTriangle, CheckCircle, Search, Pill, Zap, ShoppingBag, X } from 'lucide-react';

export default function ScanPage() {
    const [ocrText, setOcrText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setCameraStream(stream);
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        } catch { alert('Camera access denied. Please use the upload option instead.'); }
    };

    const stopCamera = () => {
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        stopCamera();
        processImage(canvas);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current!;
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d')?.drawImage(img, 0, 0);
            processImage(canvas);
        };
        img.src = URL.createObjectURL(file);
    };

    const processImage = async (canvas: HTMLCanvasElement) => {
        setScanning(true);
        setResult(null);
        try {
            const Tesseract = (await import('tesseract.js')).default;
            const { data: { text } } = await Tesseract.recognize(canvas.toDataURL(), 'eng');
            setOcrText(text);
            setScanning(false);
            if (text.trim()) analyzeText(text);
            else { setScanning(false); alert('Could not read text from image. Try a clearer photo.'); }
        } catch { setScanning(false); alert('OCR processing failed. Try uploading a clearer image.'); }
    };

    const analyzeText = async (text?: string) => {
        const t = text || ocrText;
        if (!t.trim()) return;
        setLoading(true);
        try {
            const res = await aiAPI.scanAnalyze(t, []);
            if (res?.data) setResult(res.data);
        } catch { alert('Analysis failed. Please try again.'); }
        setLoading(false);
    };

    const getSafetyColor = (score: number) => {
        if (score >= 80) return { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-400', label: 'Safe' };
        if (score >= 50) return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-400', label: 'Caution' };
        return { bg: 'from-red-500 to-rose-500', text: 'text-red-400', label: 'Warning' };
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                    <ArrowLeft size={18} className="text-gray-400" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Camera size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            AI Label Scanner
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-semibold">GROQ AI</span>
                        </h1>
                        <p className="text-xs text-gray-500">Scan any supplement label for instant AI analysis</p>
                    </div>
                </div>
            </div>

            {/* Camera / Upload Area */}
            {!result && !loading && (
                <div className="space-y-4">
                    {cameraStream ? (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10">
                            <video ref={videoRef} autoPlay playsInline className="w-full max-h-[400px] object-cover" />
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                                <button onClick={capturePhoto} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm shadow-lg">
                                    <Camera size={16} className="inline mr-2" /> Capture
                                </button>
                                <button onClick={stopCamera} className="px-4 py-3 rounded-xl glass text-gray-400 text-sm"><X size={16} /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={startCamera}
                                className="glass rounded-2xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all text-center group">
                                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera size={28} className="text-cyan-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Take Photo</h3>
                                <p className="text-xs text-gray-500">Use your camera to scan a supplement label</p>
                            </button>
                            <button onClick={() => fileInputRef.current?.click()}
                                className="glass rounded-2xl p-8 border border-white/5 hover:border-purple-500/30 transition-all text-center group">
                                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={28} className="text-purple-400" />
                                </div>
                                <h3 className="text-white font-medium mb-1">Upload Image</h3>
                                <p className="text-xs text-gray-500">Choose an existing photo of a label</p>
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </div>
                    )}

                    {/* Manual text input */}
                    <div className="glass rounded-2xl p-5 border border-white/5">
                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Pill size={14} className="text-cyan-400" /> Or paste label text manually</h3>
                        <textarea value={ocrText} onChange={e => setOcrText(e.target.value)} rows={4} placeholder="Paste supplement label text here..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none" />
                        <button onClick={() => analyzeText()} disabled={!ocrText.trim()}
                            className="mt-3 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                            <Search size={14} /> Analyze Ingredients
                        </button>
                    </div>
                </div>
            )}

            {/* Scanning indicator */}
            {scanning && (
                <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                    <Loader2 size={40} className="text-cyan-400 animate-spin mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-1">Reading label text...</h3>
                    <p className="text-xs text-gray-500">OCR processing with Tesseract.js (runs locally in your browser)</p>
                </div>
            )}

            {/* Loading AI analysis */}
            {loading && (
                <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                    <Loader2 size={40} className="text-purple-400 animate-spin mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-1">AI analyzing ingredients...</h3>
                    <p className="text-xs text-gray-500">Checking safety, interactions, and finding store matches</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4 animate-slide-up">
                    {/* Safety Score Banner */}
                    <div className={`rounded-2xl p-5 border ${result.safetyScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : result.safetyScore >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSafetyColor(result.safetyScore).bg} flex items-center justify-center`}>
                                    <Shield size={24} className="text-white" />
                                </div>
                                <div>
                                    <div className={`text-lg font-bold ${getSafetyColor(result.safetyScore).text}`}>Safety Score: {result.safetyScore}/100</div>
                                    <p className="text-xs text-gray-400">{result.productName} {result.brand ? `by ${result.brand}` : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => { setResult(null); setOcrText(''); }} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5">
                                Scan Another
                            </button>
                        </div>
                        {result.summary && <p className="text-sm text-gray-300 mt-3">{result.summary}</p>}
                    </div>

                    {/* Allergen Alerts */}
                    {result.allergenAlerts?.length > 0 && (
                        <div className="glass rounded-xl p-4 border border-red-500/20 bg-red-500/5">
                            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Allergen Alerts</h4>
                            {result.allergenAlerts.map((a: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                                    <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-300">{a.message}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Ingredients Table */}
                    {result.ingredients?.length > 0 && (
                        <div className="glass rounded-xl p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Pill size={14} className="text-cyan-400" /> Ingredients ({result.ingredients.length})</h4>
                            <div className="space-y-2">
                                {result.ingredients.map((ing: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                        <div>
                                            <span className="text-xs text-white">{ing.commonName || ing.name}</span>
                                            {ing.commonName && ing.name !== ing.commonName && (
                                                <span className="text-[10px] text-gray-500 ml-2">({ing.name})</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">{ing.amount}{ing.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {result.warnings?.length > 0 && (
                        <div className="glass rounded-xl p-4 border border-white/5">
                            <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Label Warnings</h4>
                            {result.warnings.map((w: string, i: number) => (
                                <p key={i} className="text-xs text-gray-400 mb-1">&#8226; {w}</p>
                            ))}
                        </div>
                    )}

                    {/* Store Matches */}
                    {result.matchingProducts?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2 px-1"><ShoppingBag size={14} className="text-cyan-400" /> Similar Products in Our Store</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {result.matchingProducts.slice(0, 8).map((p: any) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response time */}
                    {result.responseTimeMs && (
                        <p className="text-[10px] text-gray-600 text-center flex items-center justify-center gap-2">
                            <Zap size={10} className="text-amber-400" /> Analysis completed in {(result.responseTimeMs / 1000).toFixed(1)}s with Groq LLaMA 3.3
                        </p>
                    )}
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
