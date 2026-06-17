'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layouts/Navbar';
import { Footer } from '@/components/layouts/Footer';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          {!isDashboard && <Navbar />}
          <main className="flex-1">{children}</main>
          {!isDashboard && <Footer />}
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
