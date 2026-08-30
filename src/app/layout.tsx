import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from 'react';

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skylark Intelligence | Obsidian Command",
  description: "Conversational Business Intelligence agent for Monday.com",
};

import CustomCursor from "@/components/ui/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter bg-obsidian-900 text-zinc-200 selection:bg-primary/30">
        <CustomCursor />
        <div className="ambient-bg">
          <div className="ambient-blob-1" />
          <div className="ambient-blob-2" />
        </div>
        <div className="ambient-grid" />
        {children}
      </body>
    </html>
  );
}
