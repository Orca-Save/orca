import { ConfigProvider } from '@/components/ConfigProvider';
import { SessionProvider } from '@/components/SessionProvider';
import { mainThemeConfig } from '@/lib/themes';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter, Open_Sans } from 'next/font/google';
import './globals.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
});

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Orca',
  description: 'Impulse Save!',
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
      </head>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.variable
        )}>
        <SessionProvider>
          <ConfigProvider theme={mainThemeConfig}>{children}</ConfigProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
