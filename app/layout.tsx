import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AssetView - Crypto Asset Analysis',
  description: 'Professional cryptocurrency research platform',
  icons: {
    icon: '/glass2.png?v=1', 
    shortcut: '/glass2.png?v=1',
    apple: '/glass2.png?v=1',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/glass2.png?v=1" type="image/png" />
        <link rel="shortcut icon" href="/glass2.png?v=1" type="image/png" />
        <link rel="apple-touch-icon" href="/glass2.png?v=1" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}