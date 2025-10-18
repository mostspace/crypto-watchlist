import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ToastContainer } from "@/components/ToastContainer";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Watchlist",
  description: "A watchlist for your favorite cryptocurrencies",
  keywords: ["cryptocurrency", "bitcoin", "ethereum", "crypto", "trading", "prices"],
  authors: [{ name: "Crypto Watchlist" }],
  creator: "Crypto Watchlist",
  publisher: "Crypto Watchlist",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "Crypto Watchlist",
    description: "A watchlist for your favorite cryptocurrencies",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Watchlist",
    description: "A watchlist for your favorite cryptocurrencies",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="/preload-critical.js" async></script>
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <ToastProvider>
          <FavoritesProvider>
            {children}
            <ToastContainer />
            <ScrollToTopButton />
          </FavoritesProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
