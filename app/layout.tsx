import type { Metadata } from 'next';
import { Playfair_Display, Inter, Dancing_Script } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProvider } from '@/lib/context';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s — Us Together.. K and A',
    default: 'Us Together.. K and A',
  },
  description: 'Our private Nepal adventure journal — K & A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${dancing.variable}`}
    >
      <body className="min-h-dvh flex flex-col">
        <AppProvider>
          {children}
        </AppProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'oklch(0.99 0.01 80)',
              border: '1px solid oklch(0.88 0.04 80)',
              color: 'oklch(0.25 0.05 60)',
              fontFamily: 'var(--font-inter)',
            },
          }}
        />
      </body>
    </html>
  );
}
