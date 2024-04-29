import { ConfigProvider, darkAlgorithm } from "@/components/ConfigProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-opensans",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Orca",
  description: "Impulse Save!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable
        )}
      >
        <SessionProvider>
          <ConfigProvider
            theme={{
              algorithm: darkAlgorithm,
            }}
          >
            {children}
          </ConfigProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
