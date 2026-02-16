'use client';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    color: '#e2e8f0',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                },
                success: {
                    iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
                },
                error: {
                    iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
                },
            }}
        />
    );
}
