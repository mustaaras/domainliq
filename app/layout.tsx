import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { auth } from "@/auth";
import Script from "next/script";
import Footer from "@/components/footer";
import CookieConsent from "@/components/cookie-consent";
import ChatNotificationBanner from "@/components/chat-notification-banner";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://domainliq.com"),
  title: "DomainLiq - Domain Liquidation Platform",
  description: "Sell and buy domains quickly. The easiest way to liquidate your domain portfolio.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const headersList = await headers();
  const isCustomDomain = headersList.get('x-is-custom-domain') === 'true';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KY9NS5RTFS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KY9NS5RTFS');
          `}
        </Script>

        <Providers session={session}>
          {children}
          {!isCustomDomain && <Footer />}
          <CookieConsent />
          <ChatNotificationBanner />
        </Providers>
      </body>
    </html>
  );
}
