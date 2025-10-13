import { Provider } from '@/components/ui';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
});

const interMono = Inter({
  variable: '--font-inter-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Libra',
  description: 'Library Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${interMono.variable} antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
