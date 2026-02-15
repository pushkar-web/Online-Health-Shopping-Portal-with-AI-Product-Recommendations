'use client';

interface Props {
    text?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }: Props) {
    const sizeMap = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' };
    const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className={`${sizeMap[size]} border-primary-400 border-t-transparent rounded-full animate-spin`} />
            {text && <span className={`${textSize[size]} text-gray-400 animate-pulse`}>{text}</span>}
        </div>
    );
}
