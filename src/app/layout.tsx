import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VolitionCI — Autonomous DevSecOps & IaC Pipeline Generator",
  description:
    "Autonomous repository analysis, interactive architectural interrogation, and self-healing CI/CD, Terraform, and Kubernetes pipeline generator.",
  icons: {
    icon: [
      { url: "/icon.png?v=3", type: "image/png" },
      { url: "/logo.png?v=3", type: "image/png" },
    ],
    shortcut: "/icon.png?v=3",
    apple: "/apple-icon.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=3" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
