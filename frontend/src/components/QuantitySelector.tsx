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
        <div className="inline-flex items-center gap-0 rounded-md border border-outlineVar/20 overflow-hidden">
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                disabled={disabled || value <= min}
                className="w-9 h-9 flex items-center justify-center bg-vc-surface-high hover:bg-vc-surface-highest text-outline hover:text-onSurface transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
            >−</button>
            <span className="w-10 h-9 flex items-center justify-center text-sm font-semibold text-onSurface bg-vc-surface border-x border-outlineVar/20 stat-number">
                {value}
            </span>
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                disabled={disabled || value >= max}
                className="w-9 h-9 flex items-center justify-center bg-vc-surface-high hover:bg-vc-surface-highest text-outline hover:text-onSurface transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
            >+</button>
        </div>
    );
}
