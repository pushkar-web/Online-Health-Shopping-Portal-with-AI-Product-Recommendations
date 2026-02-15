/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                primary: { 50: '#eef9ff', 100: '#d9f1ff', 200: '#bce8ff', 300: '#8edbff', 400: '#59c5ff', 500: '#33a8ff', 600: '#1b89f5', 700: '#1470e1', 800: '#175bb6', 900: '#194e8f', 950: '#143157' },
                accent: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
                health: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75' },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
            },
            keyframes: {
                float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
                slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
            },
        },
    },
    plugins: [],
};
