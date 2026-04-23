'use client';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, change, icon, trend = 'neutral' }: StatsCardProps) {
    return (
        <div className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-5 hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] text-outline uppercase tracking-wider font-medium">{title}</span>
                {icon && <span className="text-lg opacity-60">{icon}</span>}
            </div>
            <div className="text-2xl font-bold text-onSurface stat-number mb-1">{value}</div>
            {change && (
                <span className={`text-xs font-medium ${
                    trend === 'up' ? 'text-sage' : trend === 'down' ? 'text-vcError' : 'text-outline'
                }`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
                </span>
            )}
        </div>
    );
}
