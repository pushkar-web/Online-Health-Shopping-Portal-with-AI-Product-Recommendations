'use client';

interface Props {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export default function QuantitySelector({ value, onChange, min = 1, max = 99, disabled = false }: Props) {
    return (
        <div className="inline-flex items-center gap-0 rounded-lg border border-white/10 overflow-hidden">
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
            >−</button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold text-white bg-white/[0.02] border-x border-white/10 stat-number">
                {value}
            </span>
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
            >+</button>
        </div>
    );
}
