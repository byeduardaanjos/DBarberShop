import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barbearia do Vini | Do tradicional ao moderno",
  description: "Protótipo visual premium da Barbearia do Vini, em Palhoça — SC.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
