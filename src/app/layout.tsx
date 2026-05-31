import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import ConfettiBackground from "@/components/effects/ConfettiBackground";

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tradutor de Voz",
  description:
    "Grave, transcreva e traduza sua voz instantaneamente com Whisper e GPT-4o.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tradutor",
  },
  icons: {
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="font-[family-name:var(--font-syne)] antialiased">
        <ConfettiBackground />
        <div style={{ position: "relative", zIndex: 1, minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {children}
        </div>
        <PWAInstallBanner />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
