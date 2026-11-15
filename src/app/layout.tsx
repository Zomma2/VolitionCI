import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VolitionCI — Autonomous DevSecOps & IaC Synthesis Platform",
    template: "%s | VolitionCI",
  },
  description:
    "Autonomous repository analysis, consultative architectural interrogation, and ReAct self-healing synthesis for CI/CD pipelines, Terraform HCL, Kubernetes manifests, and Docker Compose.",
  icons: {
    icon: [
      { url: "/icon.png?v=4", type: "image/png" },
      { url: "/logo.png?v=4", type: "image/png" },
    ],
    shortcut: "/icon.png?v=4",
    apple: "/apple-icon.png?v=4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png?v=4" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=4" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-[#09090b] text-zinc-100`}
      >
        <SiteHeader />
        <div className="flex-1 flex flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
