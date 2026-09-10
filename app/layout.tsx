import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import "./globals.css";

const viniDisplay = Barlow_Condensed({
  variable: "--font-vini-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const viniSans = Manrope({
  variable: "--font-vini-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Barbearia do Vini | Palhoça",
    template: "%s | Barbearia do Vini",
  },
  description: "Barbearia do Vini em São Sebastião, Palhoça. Conheça a barbearia, veja trabalhos, avaliações, localização e opções de agendamento.",
  keywords: [
    "Barbearia do Vini",
    "barbearia em Palhoça",
    "barbeiro em Palhoça",
    "barbearia São Sebastião",
  ],
  openGraph: {
    title: "Barbearia do Vini | Palhoça",
    description: "Estilo, presença e praticidade em São Sebastião, Palhoça.",
    locale: "pt_BR",
    type: "website",
  },
  other: {
    "codex-preview": "development",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${viniDisplay.variable} ${viniSans.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BarberShop",
              name: "Barbearia do Vini",
              address: {
                "@type": "PostalAddress",
                streetAddress: "R. Tomaz Domingos da Silveira, 196",
                addressLocality: "Palhoça",
                addressRegion: "SC",
                postalCode: "88136-000",
                addressCountry: "BR",
              },
              telephone: "+55 48 99646-1346",
              sameAs: ["https://www.instagram.com/barbeariad.vini"],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
