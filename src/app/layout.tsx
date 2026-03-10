import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NurseEd Africa - Nursing Education Platform for East Africa",
  description: "Comprehensive nursing education platform with 464+ topics for nurses in East Africa. Learn anatomy, medical-surgical nursing, paediatrics, mental health, pharmacology and more.",
  keywords: ["nursing education", "East Africa", "nurses", "anatomy", "medical-surgical", "paediatrics", "mental health", "pharmacology", "nursing notes"],
  authors: [{ name: "NurseEd Africa Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NurseEd Africa - Nursing Education Platform",
    description: "464+ nursing education topics for East African nurses",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NurseEd Africa",
    description: "Nursing education platform for East Africa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
