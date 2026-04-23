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
            <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-sage/10 flex items-center justify-center">
                    <User size={28} className="text-sage" />
                </div>
                <h2 className="text-2xl font-bold text-onSurface mb-2">Please sign in</h2>
                <p className="text-onSurfaceVar text-sm mb-8">Sign in to manage your health profile and get personalized recommendations.</p>
                <Link href="/login" className="btn-sage px-8 py-3">Sign In</Link>
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
        if (bmiVal < 25) return { label: 'Normal', color: 'text-sage' };
        if (bmiVal < 30) return { label: 'Overweight', color: 'text-amber' };
        return { label: 'Obese', color: 'text-vcError' };
    };

    const tabs = [
        { id: 'health' as const, label: 'Health Profile', icon: <Activity size={14} /> },
        { id: 'dietary' as const, label: 'Goals & Diet', icon: <Heart size={14} /> },
        { id: 'medical' as const, label: 'Medical Info', icon: <Shield size={14} /> },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg shadow-vc-lg flex items-center gap-2 animate-slide-in-right ${toast.type === 'success' ? 'bg-sage-dark text-sage' : 'bg-vcErrorDark text-vcError'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="text-sm font-medium">{toast.message}</span>
                </div>
            )}

            {/* Profile Header */}
            <div className="relative overflow-hidden rounded-xl border border-outlineVar/15 mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-sage/8 via-stone/5 to-amber/5" />
                <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-20 h-20 rounded-xl bg-sage/15 flex items-center justify-center text-3xl font-bold text-sage border border-sage/20">
                        {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <h1 className="text-2xl font-bold text-onSurface">{user?.firstName} {user?.lastName}</h1>
                        <p className="text-outline text-sm mt-1">{user?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <span className="vc-badge vc-badge-sage">
                                {user?.role || 'Member'}
                            </span>
                            {bmi && (
                                <span className={`vc-badge ${parseFloat(bmi) < 25 ? 'vc-badge-sage' : 'vc-badge-amber'}`}>
                                    BMI: {bmi} · {getBmiCategory(parseFloat(bmi)).label}
                                </span>
                            )}
                            {selectedGoals.length > 0 && (
                                <span className="vc-badge vc-badge-stone">
                                    {selectedGoals.length} Goals Active
                                </span>
                            )}
                        </div>
                    </div>
                    <Link href="/recommendations" className="btn-outline-sage text-sm flex items-center gap-1">
                        View AI Picks <ChevronRight size={14} />
                    </Link>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-sage/10 text-sage'
                            : 'text-onSurfaceVar hover:text-onSurface hover:bg-vc-surface-high/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab: Health Profile */}
            {activeTab === 'health' && (
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                    <h2 className="text-base font-semibold text-onSurface mb-1 flex items-center gap-2">
                        <Activity size={16} className="text-sage" /> Health Profile
                    </h2>
                    <p className="text-sm text-outline mb-6">Your physical stats power personalized AI recommendations.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar mb-2 flex items-center gap-1.5">
                                <Calendar size={12} className="text-outline" /> Age
                            </label>
                            <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })}
                                placeholder="Enter your age"
                                className="vc-input py-3" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar mb-2 flex items-center gap-1.5">
                                <User size={12} className="text-outline" /> Gender
                            </label>
                            <select value={profile.gender} onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                className="vc-input py-3">
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar mb-2 flex items-center gap-1.5">
                                <Ruler size={12} className="text-outline" /> Height (cm)
                            </label>
                            <input type="number" value={profile.height} onChange={e => setProfile({ ...profile, height: e.target.value })}
                                placeholder="e.g. 170"
                                className="vc-input py-3" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-onSurfaceVar mb-2 flex items-center gap-1.5">
                                <Scale size={12} className="text-outline" /> Weight (kg)
                            </label>
                            <input type="number" value={profile.weight} onChange={e => setProfile({ ...profile, weight: e.target.value })}
                                placeholder="e.g. 70"
                                className="vc-input py-3" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-onSurfaceVar mb-2 block">Age Group</label>
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
                                        className={`px-4 py-2 rounded-md text-sm transition-all ${profile.ageGroup === ag.value
                                            ? 'bg-sage/15 text-sage border border-sage/25'
                                            : 'bg-vc-surface text-onSurfaceVar border border-outlineVar/15 hover:border-outlineVar/30'
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
                        <div className="mt-6 p-4 rounded-lg bg-vc-surface border border-outlineVar/15">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-outline">Calculated BMI</span>
                                    <div className={`text-2xl font-bold stat-number ${getBmiCategory(parseFloat(bmi)).color}`}>{bmi}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-md text-sm font-medium ${getBmiCategory(parseFloat(bmi)).color} bg-vc-surface-high`}>
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
                    <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                        <h2 className="text-base font-semibold text-onSurface mb-1 flex items-center gap-2">
                            <Heart size={16} className="text-vcError" /> Health Goals
                        </h2>
                        <p className="text-sm text-outline mb-4">Select goals to get targeted product recommendations.</p>
                        <div className="flex flex-wrap gap-2">
                            {goals.map(g => (
                                <button key={g} onClick={() => toggleGoal(g)}
                                    className={`text-sm px-4 py-2 rounded-md border transition-all ${selectedGoals.includes(g)
                                        ? 'bg-sage/15 border-sage/30 text-sage'
                                        : 'bg-vc-surface border-outlineVar/15 text-onSurfaceVar hover:border-outlineVar/30 hover:text-onSurface'
                                        }`}>
                                    {selectedGoals.includes(g) ? '✓ ' : ''}{g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                        <h2 className="text-base font-semibold text-onSurface mb-1">Dietary Preferences</h2>
                        <p className="text-sm text-outline mb-4">Helps us filter products for your diet.</p>
                        <input type="text" value={profile.dietaryPreferences}
                            onChange={e => setProfile({ ...profile, dietaryPreferences: e.target.value })}
                            className="vc-input py-3"
                            placeholder="e.g., Vegan, Gluten-Free, Organic, Keto" />
                    </div>

                    <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                        <h2 className="text-base font-semibold text-onSurface mb-1">Allergies</h2>
                        <p className="text-sm text-outline mb-4">We&apos;ll avoid products with these ingredients.</p>
                        <input type="text" value={profile.allergies}
                            onChange={e => setProfile({ ...profile, allergies: e.target.value })}
                            className="vc-input py-3"
                            placeholder="e.g., Shellfish, Dairy, Soy, Peanuts" />
                    </div>
                </div>
            )}

            {/* Tab: Medical */}
            {activeTab === 'medical' && (
                <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                    <h2 className="text-base font-semibold text-onSurface mb-1 flex items-center gap-2">
                        <Shield size={16} className="text-stone" /> Medical Conditions
                    </h2>
                    <p className="text-sm text-outline mb-4">Optional. Helps AI provide safer recommendations and drug interaction alerts.</p>
                    <textarea
                        value={profile.medicalConditions}
                        onChange={e => setProfile({ ...profile, medicalConditions: e.target.value })}
                        rows={4}
                        className="vc-input resize-none"
                        placeholder="e.g., Diabetes, Hypertension, Thyroid disorder"
                    />
                    <div className="mt-4 p-4 rounded-lg bg-amber/5 border border-amber/10">
                        <p className="text-xs text-amber/80 flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            This information is kept confidential and only used to personalize your health recommendations. Always consult your healthcare provider for medical advice.
                        </p>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex items-center justify-between">
                <button type="button" onClick={(e) => handleSave(e)} disabled={saving}
                    className="btn-sage px-8 py-3 disabled:opacity-50 flex items-center gap-2">
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <Link href="/recommendations" className="text-sm text-outline hover:text-sage transition-colors flex items-center gap-1">
                    View Recommendations <ChevronRight size={14} />
                </Link>
            </div>

            {/* Info Card */}
            <div className="mt-8 bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6">
                <h3 className="text-onSurface font-semibold text-sm mb-4 flex items-center gap-2">
                    <Activity size={14} className="text-sage" /> How Your Profile Powers AI
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { icon: '🎯', title: 'Goal Matching', desc: 'Products matched to your health goals' },
                        { icon: '🛡️', title: 'Safety Filtering', desc: 'Allergens and interactions flagged' },
                        { icon: '📊', title: 'Health Score', desc: 'AI calculates your wellness score' },
                        { icon: '🔄', title: 'Smart Reorders', desc: 'Predicts when to restock supplements' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-vc-surface border border-outlineVar/15">
                            <span className="text-lg">{item.icon}</span>
                            <div>
                                <div className="text-sm font-medium text-onSurface">{item.title}</div>
                                <div className="text-xs text-outline">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
