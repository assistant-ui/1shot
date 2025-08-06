import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "1shot - Transform Your Codebase in One Shot | Developer CLI Tool",
  description: "1shot is the developer CLI with premade commands for everything. Skip the docs, tutorials, and Stack Overflow rabbit holes. Just run a premade command from our registry and watch your codebase transform.",
  keywords: [
    "developer CLI",
    "code generation",
    "software integration",
    "developer tools",
    "npm package",
    "command line",
    "codebase transformation",
    "Claude Code",
    "Assistant-UI",
    "developer productivity",
    "software development",
    "API integration",
    "authentication",
    "database setup",
    "deployment automation"
  ],
  authors: [{ name: "1shot Team" }],
  creator: "1shot",
  publisher: "1shot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://1shot.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "1shot - Transform Your Codebase in One Shot",
    description: "The developer CLI with premade commands for everything. Skip the docs, tutorials, and Stack Overflow rabbit holes. Just run a premade command from our registry and watch your codebase transform.",
    url: "https://1shot.dev",
    siteName: "1shot",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "1shot - Developer CLI Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "1shot - Transform Your Codebase in One Shot",
    description: "The developer CLI with premade commands for everything. Skip the docs, tutorials, and Stack Overflow rabbit holes.",
    images: ["/og-image.png"],
    creator: "@1shot_dev",
    site: "@1shot_dev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  classification: "Developer Tools",
  other: {
    "theme-color": "#3b82f6",
    "color-scheme": "light",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "1shot",
    "application-name": "1shot",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "1shot",
              "description": "The developer CLI with premade commands for everything. Transform your codebase in one shot.",
              "url": "https://1shot.dev",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Windows, macOS, Linux",
              "softwareVersion": "1.0.0",
              "author": {
                "@type": "Organization",
                "name": "1shot",
                "url": "https://1shot.dev"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              },
              "featureList": [
                "Tailored commands",
                "Cross-framework support", 
                "Battle-tested implementations",
                "Progress insights",
                "Claude Code integration",
                "Assistant-UI integration"
              ]
            })
          }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="1shot" />
        <meta name="application-name" content="1shot" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
