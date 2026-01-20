import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://simonsilvercaldaie.it";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Corsi Caldaie | Formazione Tecnica per Manutentori e Installatori - Simon Silver",
    template: "%s | Simon Silver Caldaie"
  },
  description: "Video corsi professionali per tecnici caldaie. Formazione avanzata su diagnosi guasti, manutenzione e riparazione caldaie. Diventa un tecnico caldaie esperto con Simon Silver.",
  keywords: [
    "corsi caldaie",
    "formazione tecnici caldaie",
    "corso manutentore caldaie",
    "come diventare tecnico caldaie",
    "formazione installatori caldaie",
    "diagnosi guasti caldaie",
    "riparazione caldaie corso",
    "manutenzione caldaie formazione",
    "video corsi caldaie",
    "tecnico caldaie professionale",
    "corso caldaie online",
    "formazione caldaie condensazione",
    "corso diagnosi caldaie",
    "Simon Silver caldaie"
  ],
  authors: [{ name: "Simon Silver", url: siteUrl }],
  creator: "Simon Silver",
  publisher: "Simon Silver Caldaie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    siteName: "Simon Silver Caldaie",
    title: "Corsi Caldaie | Formazione Tecnica Professionale - Simon Silver",
    description: "Video corsi professionali per tecnici caldaie. Formazione avanzata su diagnosi guasti, manutenzione e riparazione. Diventa un esperto con Simon Silver.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Simon Silver Caldaie - Formazione Tecnica Professionale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corsi Caldaie | Formazione Tecnica - Simon Silver",
    description: "Video corsi professionali per tecnici caldaie. Formazione avanzata su diagnosi guasti e riparazione.",
    images: ["/og-image.png"],
    creator: "@SimonSilver",
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
    // Add Google Search Console verification code here when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Simon Silver Caldaie",
              "url": siteUrl,
              "logo": `${siteUrl}/logo.png`,
              "description": "Video corsi professionali per tecnici caldaie. Formazione avanzata su diagnosi guasti, manutenzione e riparazione caldaie.",
              "sameAs": [
                "https://www.youtube.com/@SimonSilverCaldaie",
                "https://www.instagram.com/simon_silver"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": `${siteUrl}/contatti`
              },
              "areaServed": {
                "@type": "Country",
                "name": "Italy"
              },
              "knowsLanguage": "Italian"
            }),
          }}
        />
        {/* JSON-LD for Website Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Simon Silver Caldaie",
              "url": siteUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/catalogo?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
