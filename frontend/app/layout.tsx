import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google"; // 🔹 Premium Fonts
import "./globals.css";
import { Providers } from "./providers"; // Import the file we created above

// Load fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"]
});

// 🔹 SEO & SOCIAL METADATA
export const metadata: Metadata = {
  metadataBase: new URL('https://futureshop.online'), // Your actual domain
  title: {
    default: "PriceAI | The Intelligent Commerce Engine",
    template: "%s | PriceAI"
  },
  description: "Compare prices across Amazon, Flipkart & more in real-time. Track price drops, get AI insights, and shop smarter with PriceAI.",
  keywords: ["Price Comparison", "AI Shopping", "Deal Tracker", "Amazon vs Flipkart", "PriceAI"],
  authors: [{ name: "Priyansu Dash" }],
  creator: "Priyansu Dash",

  // 🔹 GOOGLE VERIFICATION (Added this block)
  verification: {
    google: "fl9ZTnKp55v3pD2Xea35wzlloWFGG0c2wsDe_rwwcvI",
  },
  
  // Facebook / WhatsApp / LinkedIn Preview
  openGraph: {
    title: "PriceAI - Stop Overpaying Online",
    description: "The world's most advanced AI price comparison tool. Track history, predict drops, and save money.",
    url: 'https://futureshop.online',
    siteName: 'PriceAI',
    images: [
      {
        url: '/opengraph-image.png', // We will add this image next
        width: 1200,
        height: 630,
        alt: 'PriceAI Dashboard Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "PriceAI | AI-Powered Price Tracking",
    description: "Real-time price comparison for smart shoppers. Don't buy until you check PriceAI.",
    images: ['/opengraph-image.png'], // Same preview image
    creator: '@priyansu_dash', // Replace with your handle if you want
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-slate-50 dark:bg-[#020617]`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}