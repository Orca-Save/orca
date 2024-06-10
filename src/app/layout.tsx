import AppInsightsLayout from '@/components/AppInsightsLayout';
import { ConfigProvider } from '@/components/ConfigProvider';
import { SessionProvider } from '@/components/SessionProvider';
import { mainThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppInsightService } from './_components/appInsightsClient';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Orca',
  description: 'Impulse saving.!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1'
        />

        <meta property='og:url' content='https://www.orca-money.com' />
        <meta property='og:title' content='Orca | Impulse saving.' />
        <meta
          property='og:description'
          content="Stop buying what you don't need so you can save for what you really want. Orca is the personal finance app that makes you better, not your budget."
        />
        <meta property='og:site_name' content='orca-money.com' />

        <meta
          property='og:image'
          content='https://uploads-ssl.webflow.com/660d63c5bb6c967462fada51/6615fb420a726c9f1dba29f0_Frame%201.png'
        />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
      </head>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}
      >
        <SessionProvider>
          <AppInsightsLayout>
            <AppInsightService />
            <ConfigProvider theme={mainThemeConfig}>{children}</ConfigProvider>
          </AppInsightsLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
