'use client';
import { useState, useEffect } from 'react';
import { aiAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, BookOpen, GraduationCap, ChevronRight, CheckCircle, XCircle, Lightbulb, Zap, Brain, Heart, Pill, Leaf, Dumbbell, Shield, Sparkles, Eye, Trophy, RotateCcw } from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
    'Vitamins & Minerals': <Pill size={20} className="text-cyan-400" />,
    'Immunity': <Shield size={20} className="text-emerald-400" />,
    'Mental Health': <Brain size={20} className="text-purple-400" />,
    'Nutrition': <Leaf size={20} className="text-green-400" />,
    'Fitness': <Dumbbell size={20} className="text-amber-400" />,
    'Heart Health': <Heart size={20} className="text-red-400" />,
    'Supplements': <Sparkles size={20} className="text-indigo-400" />,
    'General Health': <Eye size={20} className="text-teal-400" />,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
    'Vitamins & Minerals': 'from-cyan-500 to-blue-500',
    'Immunity': 'from-emerald-500 to-green-500',
    'Mental Health': 'from-purple-500 to-violet-500',
    'Nutrition': 'from-green-500 to-lime-500',
    'Fitness': 'from-amber-500 to-orange-500',
    'Heart Health': 'from-red-500 to-rose-500',
    'Supplements': 'from-indigo-500 to-purple-500',
    'General Health': 'from-teal-500 to-cyan-500',
};

export default function LearnPage() {
    const [topics, setTopics] = useState<any[]>([]);
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lessonLoading, setLessonLoading] = useState(false);
    const [view, setView] = useState<'topics' | 'lesson' | 'quiz' | 'results'>('topics');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizResults, setQuizResults] = useState<any>(null);
    const [quizSubmitting, setQuizSubmitting] = useState(false);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        aiAPI.learnTopics().then(r => {
            if (r?.data) setTopics(r.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const loadLesson = async (topicId: string, level?: string) => {
        setLessonLoading(true);
        setView('lesson');
        try {
            const res = await aiAPI.learnLesson(topicId, level);
            if (res?.data) {
                setLesson(res.data);
                setQuizAnswers([]);
                setCurrentQuizIndex(0);
                setShowExplanation(false);
            }
        } catch {
            alert('Failed to load lesson. Please try again.');
            setView('topics');
        }
        setLessonLoading(false);
    };

    const startQuiz = () => {
        setView('quiz');
        setCurrentQuizIndex(0);
        setQuizAnswers([]);
        setShowExplanation(false);
    };

    const selectAnswer = (answerIdx: number) => {
        if (showExplanation) return;
        const updated = [...quizAnswers];
        updated[currentQuizIndex] = answerIdx;
        setQuizAnswers(updated);
        setShowExplanation(true);
    };

    const nextQuestion = () => {
        setShowExplanation(false);
        if (currentQuizIndex < (lesson?.quiz?.length || 0) - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        if (!lesson) return;
        setQuizSubmitting(true);
        try {
            const res = await aiAPI.learnQuizSubmit(lesson.topicId, quizAnswers);
            if (res?.data) setQuizResults(res.data);
        } catch {
            // Calculate locally if API fails
            const correct = quizAnswers.filter((a, i) => lesson.quiz?.[i]?.correctIndex === a).length;
            setQuizResults({ totalQuestions: lesson.quiz?.length || 0, correct, message: `You scored ${correct}/${lesson.quiz?.length || 0}!` });
        }
        setView('results');
        setQuizSubmitting(false);
    };

    const categories = Array.from(new Set(topics.map(t => t.category)));
    const filteredTopics = selectedCategory ? topics.filter(t => t.category === selectedCategory) : topics;

    if (loading) return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-white/5 rounded-xl w-64" />
                <div className="grid grid-cols-2 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}</div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                {view !== 'topics' ? (
                    <button onClick={() => { setView('topics'); setLesson(null); setQuizResults(null); }}
                        className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </button>
                ) : (
                    <Link href="/ai/dashboard" className="p-2 glass rounded-xl hover:bg-white/10 transition-colors">
                        <ArrowLeft size={18} className="text-gray-400" />
                    </Link>
                )}
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <GraduationCap size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Health Literacy Hub
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-semibold">AI LESSONS</span>
                        </h1>
                        <p className="text-xs text-gray-500">
                            {view === 'topics' ? 'Learn about health, supplements & wellness' : lesson?.title || 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Topics View */}
            {view === 'topics' && (
                <div className="space-y-6">
                    {/* Category Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${!selectedCategory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-gray-400 border border-white/5 hover:bg-white/10'}`}>
                            All Topics
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${cat === selectedCategory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-gray-400 border border-white/5 hover:bg-white/10'}`}>
                                {CATEGORY_ICONS[cat] || <BookOpen size={12} />}
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Topic Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredTopics.map((topic: any) => {
                            const gradient = CATEGORY_GRADIENTS[topic.category] || 'from-gray-500 to-gray-600';
                            const icon = CATEGORY_ICONS[topic.category] || <BookOpen size={20} className="text-gray-400" />;
                            return (
                                <button key={topic.id} onClick={() => loadLesson(topic.id, topic.defaultLevel)}
                                    className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all text-left group">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                            {icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{topic.title}</h3>
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{topic.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500">{topic.category}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{topic.defaultLevel}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-emerald-400 mt-1 transition-colors" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lesson View */}
            {view === 'lesson' && (
                <div className="space-y-4">
                    {lessonLoading ? (
                        <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                            <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                            <h3 className="text-white font-medium mb-1">Generating your lesson...</h3>
                            <p className="text-xs text-gray-500">AI is crafting personalized content with Groq LLaMA 3.3</p>
                        </div>
                    ) : lesson ? (
                        <>
                            {/* Lesson header */}
                            <div className={`rounded-2xl p-5 bg-gradient-to-r ${CATEGORY_GRADIENTS[lesson.category] || 'from-emerald-500 to-teal-500'} relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">{lesson.category}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white">{lesson.level}</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
                                </div>
                            </div>

                            {/* Introduction */}
                            {lesson.introduction && (
                                <div className="glass rounded-xl p-5 border border-white/5">
                                    <p className="text-sm text-gray-300 leading-relaxed">{lesson.introduction}</p>
                                </div>
                            )}

                            {/* Sections */}
                            {lesson.sections?.map((section: any, i: number) => (
                                <div key={i} className="glass rounded-xl p-5 border border-white/5">
                                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">{i + 1}</div>
                                        {section.heading}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{section.content}</p>
                                </div>
                            ))}

                            {/* Key Takeaways */}
                            {lesson.keyTakeaways?.length > 0 && (
                                <div className="glass rounded-xl p-5 border border-emerald-500/20 bg-emerald-500/5">
                                    <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                        <Lightbulb size={14} /> Key Takeaways
                                    </h3>
                                    <div className="space-y-2">
                                        {lesson.keyTakeaways.map((t: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <CheckCircle size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-xs text-gray-300">{t}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quiz CTA */}
                            {lesson.quiz?.length > 0 && (
                                <button onClick={startQuiz}
                                    className="w-full glass rounded-xl p-5 border border-purple-500/20 hover:border-purple-500/40 transition-all text-center group">
                                    <Brain size={28} className="text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-white font-medium mb-1">Test Your Knowledge</h3>
                                    <p className="text-xs text-gray-500">{lesson.quiz.length} questions to check your understanding</p>
                                </button>
                            )}

                            {/* Response time */}
                            {lesson.responseTimeMs && (
                                <p className="text-[10px] text-gray-600 text-center flex items-center justify-center gap-2">
                                    <Zap size={10} className="text-amber-400" /> Lesson generated in {(lesson.responseTimeMs / 1000).toFixed(1)}s
                                </p>
                            )}
                        </>
                    ) : null}
                </div>
            )}

            {/* Quiz View */}
            {view === 'quiz' && lesson?.quiz && (
                <div className="space-y-4">
                    {/* Progress */}
                    <div className="flex items-center gap-2">
                        {lesson.quiz.map((_: any, i: number) => (
                            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < currentQuizIndex ? 'bg-emerald-500' : i === currentQuizIndex ? 'bg-purple-500' : 'bg-white/10'}`} />
                        ))}
                    </div>

                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Question {currentQuizIndex + 1} of {lesson.quiz.length}</span>
                        <h3 className="text-base font-medium text-white mt-2 mb-5">{lesson.quiz[currentQuizIndex].question}</h3>

                        <div className="space-y-2">
                            {lesson.quiz[currentQuizIndex].options?.map((opt: string, oi: number) => {
                                const selected = quizAnswers[currentQuizIndex] === oi;
                                const correct = lesson.quiz[currentQuizIndex].correctIndex === oi;
                                const revealed = showExplanation;

                                let style = 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300';
                                if (revealed && correct) style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                                else if (revealed && selected && !correct) style = 'bg-red-500/10 border-red-500/30 text-red-400';
                                else if (selected && !revealed) style = 'bg-purple-500/10 border-purple-500/30 text-purple-400';

                                return (
                                    <button key={oi} onClick={() => selectAnswer(oi)} disabled={showExplanation}
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${style}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${revealed && correct ? 'bg-emerald-500 text-white' : revealed && selected ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                            {revealed && correct ? <CheckCircle size={12} /> : revealed && selected && !correct ? <XCircle size={12} /> : String.fromCharCode(65 + oi)}
                                        </div>
                                        <span className="text-sm">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && lesson.quiz[currentQuizIndex].explanation && (
                            <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-xs text-indigo-300 flex items-start gap-2">
                                    <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
                                    {lesson.quiz[currentQuizIndex].explanation}
                                </p>
                            </div>
                        )}

                        {/* Next button */}
                        {showExplanation && (
                            <button onClick={nextQuestion} disabled={quizSubmitting}
                                className="mt-4 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                                {quizSubmitting ? 'Submitting...' : currentQuizIndex < lesson.quiz.length - 1 ? 'Next Question' : 'See Results'}
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Results View */}
            {view === 'results' && (
                <div className="space-y-4">
                    <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                            <Trophy size={36} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Quiz Complete!</h2>
                        {quizResults && (
                            <p className="text-sm text-gray-300 mb-4">{quizResults.message}</p>
                        )}

                        {/* Score breakdown */}
                        {lesson?.quiz && (
                            <div className="space-y-2 mt-6 text-left max-w-md mx-auto">
                                {lesson.quiz.map((q: any, i: number) => {
                                    const correct = quizAnswers[i] === q.correctIndex;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                            {correct ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                                            <span className="text-xs text-gray-300 line-clamp-1">{q.question}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center mt-6">
                            <button onClick={() => { setView('topics'); setLesson(null); setQuizResults(null); }}
                                className="px-6 py-3 rounded-xl glass text-gray-300 text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                                <BookOpen size={14} /> More Topics
                            </button>
                            {lesson && (
                                <button onClick={() => { setView('quiz'); setCurrentQuizIndex(0); setQuizAnswers([]); setShowExplanation(false); setQuizResults(null); }}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                                    <RotateCcw size={14} /> Retry Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
