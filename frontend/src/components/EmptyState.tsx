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
        <div className="text-center py-20 glass-light rounded-2xl animate-fade-in">
            <span className="text-6xl block mb-4">{icon}</span>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>}
            {actionLabel && actionHref && (
                <Link href={actionHref} className="btn-primary px-8 py-3 inline-block">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
