/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                // VitaCart AI — Obsidian Grove Design System
                vc: {
                    bg: '#111416',
                    'surface-lowest': '#0c0f10',
                    'surface-low': '#191c1e',
                    surface: '#1d2022',
                    'surface-high': '#272a2c',
                    'surface-highest': '#323537',
                    'surface-bright': '#373a3c',
                },
                sage: {
                    DEFAULT: '#aad0ae',
                    dim: '#8ab590',
                    container: '#75997b',
                    dark: '#44664b',
                    darkest: '#2c4e34',
                    on: '#15371f',
                },
                stone: {
                    DEFAULT: '#dfc29f',
                    dim: '#c4a57e',
                    container: '#5a452b',
                    dark: '#3f2d15',
                },
                amber: {
                    DEFAULT: '#e6c181',
                    dim: '#c9a563',
                    container: '#ac8c51',
                    dark: '#5b430e',
                },
                onSurface: '#e1e2e5',
                onSurfaceVar: '#c2c8bf',
                outline: '#8c938a',
                outlineVar: '#424842',
                vcError: '#ffb4ab',
                vcErrorDark: '#93000a',
                // Keep some legacy fallbacks
                primary: {
                    50: '#f0f9f4', 100: '#dcf0e1', 200: '#bbdec3', 300: '#8ab590',
                    400: '#aad0ae', 500: '#75997b', 600: '#44664b', 700: '#2c4e34',
                    800: '#15371f', 900: '#0e3019', 950: '#00210c'
                },
                accent: {
                    50: '#fef9ec', 100: '#fef0c7', 200: '#fde29a', 300: '#e6c181',
                    400: '#c9a563', 500: '#ac8c51', 600: '#8a6f3c', 700: '#5b430e',
                    800: '#412d00', 900: '#271900'
                },
                health: {
                    50: '#f2f9f3', 100: '#e0f0e3', 200: '#c5ecc9', 300: '#aad0ae',
                    400: '#75997b', 500: '#44664b', 600: '#2c4e34', 700: '#15371f',
                    800: '#0e3019', 900: '#00210c'
                },
            },
            fontFamily: {
                sans: ['DM Sans', 'Manrope', 'system-ui', 'sans-serif'],
                display: ['DM Sans', 'Manrope', 'system-ui', 'sans-serif'],
                mono: ['DM Mono', 'monospace'],
            },
            borderRadius: {
                vc: '8px',
                'vc-sm': '6px',
                'vc-lg': '12px',
                'vc-xl': '16px',
            },
            boxShadow: {
                vc: '0 4px 24px rgba(0,0,0,0.25)',
                'vc-lg': '0 8px 40px rgba(0,0,0,0.35)',
                'vc-hover': '0 12px 48px rgba(0,0,0,0.4), 0 4px 20px rgba(170,208,174,0.05)',
                'vc-card': '0 2px 12px rgba(0,0,0,0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'float-slow': 'float 8s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'slide-down': 'slideDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'slide-in-right': 'slideInRight 0.4s ease-out forwards',
                'hero-drift': 'heroDrift 20s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite linear',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(24px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(24px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                heroDrift: {
                    '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '25%': { transform: 'translate(10px, -10px) rotate(1deg)' },
                    '50%': { transform: 'translate(-5px, 5px) rotate(-0.5deg)' },
                    '75%': { transform: 'translate(8px, 3px) rotate(0.5deg)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
        },
    },
    plugins: [],
};
