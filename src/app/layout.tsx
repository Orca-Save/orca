import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/SessionProvider";
import { ConfigProvider, darkAlgorithm } from "@/components/ConfigProvider";
import "./globals.css";

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
