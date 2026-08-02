import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_NAME = "AI Job Application Tracker";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${APP_NAME} - Land your dream job`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "AI-powered job application tracker with analytics, AI cover letters, resume analysis, and interview coaching.",
  applicationName: APP_NAME,
  keywords: [
    "job application tracker",
    "AI cover letter",
    "resume analyzer",
    "interview prep",
    "job search",
    "career",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: APP_NAME,
    title: `${APP_NAME} - Land your dream job`,
    description:
      "AI-powered job application tracker with analytics, AI cover letters, resume analysis, and interview coaching.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Land your dream job`,
    description:
      "AI-powered job application tracker with analytics, AI cover letters, resume analysis, and interview coaching.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
