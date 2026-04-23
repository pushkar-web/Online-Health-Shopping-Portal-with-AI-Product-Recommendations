'use client';
import Link from 'next/link';

interface Props {
    icon: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref }: Props) {
    return (
        <div className="text-center py-20 bg-vc-surface-high rounded-lg border border-outlineVar/15 animate-fade-in">
            <span className="text-5xl block mb-4">{icon}</span>
            <h3 className="text-lg font-semibold text-onSurface mb-2">{title}</h3>
            {description && <p className="text-onSurfaceVar text-sm mb-6 max-w-md mx-auto">{description}</p>}
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-sage px-8 py-3 inline-block">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
