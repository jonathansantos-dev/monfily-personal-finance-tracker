import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monfily - Personal Finance",
  description: "Track your income, expenses, and net worth in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
