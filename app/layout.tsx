import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MotionEnhancements from "./components/MotionEnhancements";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://imperium-barber.eluanebarrosanjos.chatgpt.site"),
  title: { default: "D.BarberShop | Barbearia Premium em Biguaçu", template: "%s | D.BarberShop" },
  description: "Atendimento individual, precisão técnica e uma experiência premium em Biguaçu, Santa Catarina.",
  keywords: ["barbearia em Biguaçu", "barbeiro em Biguaçu", "corte masculino", "barba", "D.BarberShop"],
  openGraph: { title: "D.BarberShop | Barbearia Premium em Biguaçu", description: "Atendimento individual, precisão técnica e uma experiência premium.", locale: "pt_BR", type: "website", images: ["/images/imperium-hero-v3.webp"] },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/images/dbarbershop-monogram.webp",
    shortcut: "/images/dbarbershop-monogram.webp",
    apple: "/images/dbarbershop-monogram.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"BarberShop",name:"D.BarberShop",description:"Barbearia de atendimento individual em Biguaçu.",address:{"@type":"PostalAddress",streetAddress:"Rua Francisco Roberto da Silva, 676",addressLocality:"Biguaçu",addressRegion:"SC",postalCode:"88160-000",addressCountry:"BR"},priceRange:"$$"})}} />
        <MotionEnhancements />
        {children}
      </body>
    </html>
  );
}
