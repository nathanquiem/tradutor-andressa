import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="font-[family-name:var(--font-syne)] flex flex-col items-center justify-center min-h-[100dvh] antialiased py-8">
        {children}
      </body>
    </html>
  );
}
