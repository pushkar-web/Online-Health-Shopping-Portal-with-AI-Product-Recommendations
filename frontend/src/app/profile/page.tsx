'use client';
import { useEffect, useState } from 'react';
import { profileAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User, Shield, Heart, Activity, Save, CheckCircle,
    ChevronRight, Scale, Ruler, Calendar, AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
    const { isAuthenticated, user, loadUser } = useAuthStore();
    const router = useRouter();
    const [profile, setProfile] = useState<any>({
        age: '', gender: '', height: '', weight: '',
        healthGoals: '', allergies: '', dietaryPreferences: '',
        medicalConditions: '', ageGroup: 'ADULT',
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState<'health' | 'dietary' | 'medical'>('health');

    useEffect(() => { loadUser(); }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        profileAPI.get().then(r => {
            if (r.data) {
                setProfile({
                    ...r.data,
                    age: r.data.age?.toString() || '',
                    height: r.data.height?.toString() || '',
                    weight: r.data.weight?.toString() || '',
                    healthGoals: Array.isArray(r.data.healthGoals) ? r.data.healthGoals.join(', ') : r.data.healthGoals || '',
                    allergies: Array.isArray(r.data.allergies) ? r.data.allergies.join(', ') : r.data.allergies || '',
                    dietaryPreferences: Array.isArray(r.data.dietaryPreferences) ? r.data.dietaryPreferences.join(', ') : r.data.dietaryPreferences || '',
                    medicalConditions: Array.isArray(r.data.medicalConditions) ? r.data.medicalConditions.join(', ') : r.data.medicalConditions || ''
                });
            }
        }).catch(() => { });
    }, [isAuthenticated]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSave = async (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setSaving(true);
        try {
            const payload = {
                ...profile,
                age: profile.age ? parseInt(profile.age) : null,
                height: profile.height ? parseFloat(profile.height) : null,
                weight: profile.weight ? parseFloat(profile.weight) : null,
                healthGoals: typeof profile.healthGoals === 'string' ? profile.healthGoals.split(',').map((s: string) => s.trim()).filter(Boolean) : profile.healthGoals,
                allergies: typeof profile.allergies === 'string' ? profile.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : profile.allergies,
                dietaryPreferences: typeof profile.dietaryPreferences === 'string' ? profile.dietaryPreferences.split(',').map((s: string) => s.trim()).filter(Boolean) : profile.dietaryPreferences,
                medicalConditions: typeof profile.medicalConditions === 'string' ? profile.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : profile.medicalConditions
            };

            const res = await profileAPI.update(payload);
            const updatedProfile = {
                ...res.data,
                age: res.data.age?.toString() || '',
                height: res.data.height?.toString() || '',
                weight: res.data.weight?.toString() || '',
                healthGoals: Array.isArray(res.data.healthGoals) ? res.data.healthGoals.join(', ') : res.data.healthGoals || '',
                allergies: Array.isArray(res.data.allergies) ? res.data.allergies.join(', ') : res.data.allergies || '',
                dietaryPreferences: Array.isArray(res.data.dietaryPreferences) ? res.data.dietaryPreferences.join(', ') : res.data.dietaryPreferences || '',
                medicalConditions: Array.isArray(res.data.medicalConditions) ? res.data.medicalConditions.join(', ') : res.data.medicalConditions || ''
            };

            setProfile(updatedProfile);
            useAuthStore.setState((state) => ({
                user: { ...state.user, ...res.data }
            }));

            showToast('Profile saved! Your recommendations will update.', 'success');
        } catch (error: any) {
            console.error("Save failed:", error);
            let msg = 'Failed to save profile. Please try again.';
            if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
                msg = 'Request timed out. Make sure the backend server is running.';
            } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
                msg = 'Cannot connect to server. Please start the backend (port 8080).';
            } else if (error?.response?.status === 401) {
                msg = 'Session expired. Please sign in again.';
            } else if (error?.response?.status === 403) {
                msg = 'Access denied. Please sign in again.';
            } else if (error?.response?.data?.message) {
                msg = error.response.data.message;
            }
            showToast(msg, 'error');
        }
        setSaving(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <User size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Please sign in</h2>
                <p className="text-gray-400 mb-6">Sign in to manage your health profile and get personalized recommendations.</p>
                <Link href="/login" className="btn-primary px-8 py-3">Sign In</Link>
            </div>
        );
    }

    const goals = ['Heart Health', 'Immunity', 'Fitness', 'Brain Health', 'Bone Health', 'Weight Loss', 'Energy', 'Sleep', 'Skin Health', 'Hair Health', 'Digestive Health', 'Joint Health', 'Diabetes Care', 'Eye Health', 'Stress Relief'];

    const getGoalsArray = (goalsData: any) => {
        if (!goalsData) return [];
        if (Array.isArray(goalsData)) return goalsData;
        if (typeof goalsData === 'string') return goalsData.split(',').map(g => g.trim()).filter(Boolean);
        return [];
    };
    const selectedGoals = getGoalsArray(profile.healthGoals);

    const toggleGoal = (goal: string) => {
        const updated = selectedGoals.includes(goal) ? selectedGoals.filter((g: string) => g !== goal) : [...selectedGoals, goal];
        setProfile({ ...profile, healthGoals: updated.join(',') });
    };

    // BMI calculation
    const bmi = profile.height && profile.weight
        ? (parseFloat(profile.weight) / Math.pow(parseFloat(profile.height) / 100, 2)).toFixed(1)
        : null;

    const getBmiCategory = (bmiVal: number) => {
        if (bmiVal < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
        if (bmiVal < 25) return { label: 'Normal', color: 'text-green-400' };
        if (bmiVal < 30) return { label: 'Overweight', color: 'text-yellow-400' };
        return { label: 'Obese', color: 'text-red-400' };
    };

    const tabs = [
        { id: 'health' as const, label: 'Health Profile', icon: <Activity size={16} /> },
        { id: 'dietary' as const, label: 'Goals & Diet', icon: <Heart size={16} /> },
        { id: 'medical' as const, label: 'Medical Info', icon: <Shield size={16} /> },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-in-right ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}

            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 via-purple-600/20 to-pink-600/20" />
                <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-white/10 shadow-2xl shadow-primary-500/20">
                        {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium border border-primary-500/20">
                                {user?.role || 'Member'}
                            </span>
                            {bmi && (
                                <span className={`px-3 py-1 rounded-full bg-white/5 text-xs font-medium border border-white/10 ${getBmiCategory(parseFloat(bmi)).color}`}>
                                    BMI: {bmi} · {getBmiCategory(parseFloat(bmi)).label}
                                </span>
                            )}
                            {selectedGoals.length > 0 && (
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
                                    {selectedGoals.length} Goals Active
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/recommendations" className="btn-outline text-sm flex items-center gap-1">
                            View AI Picks <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: Health Profile */}
            {activeTab === 'health' && (
                <div className="glass rounded-2xl p-6 border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        <Activity size={20} className="text-primary-400" /> Health Profile
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">Your physical stats power personalized AI recommendations.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-500" /> Age
                            </label>
                            <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })}
                                placeholder="Enter your age"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                                <User size={14} className="text-gray-500" /> Gender
                            </label>
                            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                                <Ruler size={14} className="text-gray-500" /> Height (cm)
                            </label>
                            <input type="number" value={profile.height} onChange={e => setProfile({ ...profile, height: e.target.value })}
                                placeholder="e.g. 170"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                                <Scale size={14} className="text-gray-500" /> Weight (kg)
                            </label>
                            <input type="number" value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })}
                                placeholder="e.g. 70"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Age Group</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'TEEN', label: 'Teen (13-19)' },
                                    { value: 'YOUNG_ADULT', label: 'Young Adult (20-35)' },
                                    { value: 'ADULT', label: 'Adult (36-50)' },
                                    { value: 'MIDDLE_AGED', label: 'Middle Aged (51-65)' },
                                    { value: 'SENIOR', label: 'Senior (65+)' },
                                ].map(ag => (
                                    <button
                                        key={ag.value}
                                        onClick={() => setProfile({ ...profile, ageGroup: ag.value })}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all ${profile.ageGroup === ag.value
                                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                            : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {ag.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* BMI Display */}
                    {bmi && (
                        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-gray-400">Calculated BMI</span>
                                    <div className={`text-2xl font-bold ${getBmiCategory(parseFloat(bmi)).color}`}>{bmi}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getBmiCategory(parseFloat(bmi)).color} bg-white/5`}>
                                    {getBmiCategory(parseFloat(bmi)).label}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Goals & Diet */}
            {activeTab === 'dietary' && (
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                            <Heart size={20} className="text-red-400" /> Health Goals
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">Select goals to get targeted product recommendations.</p>
                        <div className="flex flex-wrap gap-2">
                            {goals.map(g => (
                                <button key={g} onClick={() => toggleGoal(g)}
                                    className={`text-sm px-4 py-2 rounded-xl border transition-all ${selectedGoals.includes(g)
                                        ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow-lg shadow-primary-500/10'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                        }`}>
                                    {selectedGoals.includes(g) ? '✓ ' : ''}{g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-semibold text-white mb-1">🥗 Dietary Preferences</h2>
                        <p className="text-sm text-gray-500 mb-4">Helps us filter products for your diet.</p>
                        <input type="text" value={profile.dietaryPreferences}
                            onChange={e => setProfile({ ...profile, dietaryPreferences: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="e.g., Vegan, Gluten-Free, Organic, Keto" />
                    </div>

                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-semibold text-white mb-1">⚠️ Allergies</h2>
                        <p className="text-sm text-gray-500 mb-4">We'll avoid products with these ingredients.</p>
                        <input type="text" value={profile.allergies}
                            onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="e.g., Shellfish, Dairy, Soy, Peanuts" />
                    </div>
                </div>
            )}

            {/* Tab: Medical */}
            {activeTab === 'medical' && (
                <div className="glass rounded-2xl p-6 border border-white/5">
                    <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                        <Shield size={20} className="text-purple-400" /> Medical Conditions
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Optional. Helps AI provide safer recommendations and drug interaction alerts.</p>
                    <textarea
                        value={profile.medicalConditions}
                        onChange={e => setProfile({ ...profile, medicalConditions: e.target.value })}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors resize-none"
                        placeholder="e.g., Diabetes, Hypertension, Thyroid disorder"
                    />
                    <div className="mt-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <p className="text-xs text-yellow-400/80 flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            This information is kept confidential and only used to personalize your health recommendations. Always consult your healthcare provider for medical advice.
                        </p>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={(e) => handleSave(e)} disabled={saving}
                    className="px-8 py-3 rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary-500/20 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-medium transition-all cursor-pointer">
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <Link href="/recommendations" className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1">
                    View Recommendations <ChevronRight size={14} />
                </Link>
            </div>

            {/* Info Card */}
            <div className="mt-8 glass-light rounded-2xl p-6 border border-white/5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Activity size={18} className="text-primary-400" /> How Your Profile Powers AI
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { icon: '🎯', title: 'Goal Matching', desc: 'Products matched to your health goals' },
                        { icon: '🛡️', title: 'Safety Filtering', desc: 'Allergens and interactions flagged' },
                        { icon: '📊', title: 'Health Score', desc: 'AI calculates your wellness score' },
                        { icon: '🔄', title: 'Smart Reorders', desc: 'Predicts when to restock supplements' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                                <div className="text-sm font-medium text-white">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
