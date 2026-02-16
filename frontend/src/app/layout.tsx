import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
    title: 'HealthShop AI - Smart Health Shopping Portal',
    description: 'AI-powered online health shopping portal with personalized product recommendations based on your health profile and goals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning>
                <Navbar />
                <main className="min-h-screen pt-16">{children}</main>
                <Footer />
                <ToastProvider />
            </body>
        </html>
    );
}
