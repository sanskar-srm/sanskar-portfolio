import type {Metadata, Viewport} from 'next';
import {Inter, Instrument_Serif, JetBrains_Mono, Syne} from 'next/font/google';
import './globals.css';

const display = Syne({subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap'});
const serif = Instrument_Serif({subsets: ['latin'], weight: '400', style: ['italic'], variable: '--font-serif', display: 'swap'});
const body = Inter({subsets: ['latin'], variable: '--font-body', display: 'swap'});
const mono = JetBrains_Mono({subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap'});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:9002';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Sanskar Bhadani — Software Engineer',
  description:
    'Portfolio of Sanskar Bhadani, a full-stack developer building scalable, user-friendly applications and exploring generative AI.',
  openGraph: {
    title: 'Sanskar Bhadani — Software Engineer',
    description: 'Full-stack developer building scalable, user-friendly applications and exploring generative AI.',
    images: ['/profile.jpg'],
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#07070a',
  colorScheme: 'dark',
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
