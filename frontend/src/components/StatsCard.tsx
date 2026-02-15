'use client';
import { useEffect, useState } from 'react';

interface Props {
    icon: string;
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    trend?: string;
    color?: 'blue' | 'green' | 'purple' | 'amber';
}

const colorMap = {
    blue: { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    green: { bg: 'from-green-500/20 to-green-600/5', border: 'border-green-500/20', text: 'text-green-400', glow: 'shadow-green-500/10' },
    purple: { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
    amber: { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
};

export default function StatsCard({ icon, label, value, prefix = '', suffix = '', trend, color = 'blue' }: Props) {
    const [count, setCount] = useState(0);
    const c = colorMap[color];

    useEffect(() => {
        if (value === 0) return;
        const duration = 1200;
        const steps = 40;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) { setCount(value); clearInterval(timer); }
            else setCount(Math.floor(current));
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className={`glass-light rounded-xl p-5 border ${c.border} hover-card relative overflow-hidden group`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-50 group-hover:opacity-80 transition-opacity`} />
            <div className="relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{icon}</span>
                    {trend && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                            }`}>{trend}</span>
                    )}
                </div>
                <div className={`text-2xl font-bold ${c.text} stat-number mb-1`}>
                    {prefix}{count.toLocaleString()}{suffix}
                </div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
}
