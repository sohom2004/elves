import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import SiteProviders from "@/components/providers/SiteProviders";
import GuideOrbLayer from "@/components/navigation/GuideOrbLayer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Elves — AI Software Studio & SaaS Company",
    template: "%s — Elves",
  },
  description:
    "Elves builds AI-powered software, SaaS products, intelligent agents, voice systems and digital infrastructure. You focus on what matters. The Elves handle the rest.",
  keywords: [
    "AI software studio",
    "SaaS development",
    "AI agents",
    "voice agents",
    "custom software",
    "Elves",
  ],
  openGraph: {
    title: "Elves — AI Software Studio & SaaS Company",
    description:
      "You focus on what matters. The Elves handle the rest. AI-powered software, agents and systems built to keep your work moving.",
    type: "website",
    siteName: "Elves",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elves — AI Software Studio & SaaS Company",
    description: "You focus on what matters. The Elves handle the rest.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ground text-ink">
        <SiteProviders>{children}</SiteProviders>
        <GuideOrbLayer />
      </body>
    </html>
  );
}
