import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';
import VoiceAssistant from '@/components/VoiceAssistant';

export const metadata: Metadata = {
    title: 'VitaCart AI — Intelligent Health Shopping',
    description: 'AI-powered health product recommendations tailored to your goals, dietary needs, and lifestyle. Premium wellness commerce for modern health-conscious shoppers.',
    keywords: 'health supplements, AI recommendations, wellness, vitamins, nutrition, personalized health',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <Navbar />
                <main className="min-h-screen pt-16">{children}</main>
                <Footer />
                <ToastProvider />
                <VoiceAssistant />
            </body>
        </html>
    );
}
