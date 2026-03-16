import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScopeForge — AI Proposal Engine for Digital Agencies",
  description:
    "Turn a client brief into a winning proposal in under 2 minutes. AI-powered scope generation, cost estimation, and branded PDF export.",
  openGraph: {
    title: "ScopeForge — AI Proposal Engine for Digital Agencies",
    description: "Turn a client brief into a winning proposal in under 2 minutes.",
    url: "https://peravine.tech",
    siteName: "ScopeForge",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
