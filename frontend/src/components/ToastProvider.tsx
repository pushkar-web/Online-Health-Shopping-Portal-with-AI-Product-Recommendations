'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: '#272a2c',
                    color: '#e1e2e5',
                    border: '1px solid rgba(66, 72, 66, 0.15)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'DM Sans, Manrope, system-ui, sans-serif',
                    padding: '12px 16px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
                },
                success: {
                    iconTheme: { primary: '#aad0ae', secondary: '#15371f' },
                },
                error: {
                    iconTheme: { primary: '#ffb4ab', secondary: '#93000a' },
                },
            }}
        />
    );
}
