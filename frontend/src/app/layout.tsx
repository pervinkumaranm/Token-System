import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Sree Sakthi Engineering College | Student Entry Token Portal',
  description: 'Official student entry token generation and verification platform for Sree Sakthi Engineering College (SSEC). Instant PDF download and automated WhatsApp delivery.',
  keywords: 'Sree Sakthi Engineering College, SSEC, Token System, Student Entry, College Portal',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
