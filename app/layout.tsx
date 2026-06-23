import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL = "https://samadepot.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SamaDepot — Dépôts universitaires horodatés",
    template: "%s — SamaDepot",
  },
  description:
    "Plateforme de dépôt de travaux universitaires avec récépissés SHA-256. Conçue pour les universités d'Afrique de l'Ouest. Gratuit pour commencer.",
  keywords: [
    "dépôt universitaire",
    "récépissé numérique",
    "suivi de devoirs",
    "université Sénégal",
    "UCAD",
    "travaux étudiants",
    "SHA-256",
    "horodatage",
  ],
  authors: [{ name: "SamaDepot", url: BASE_URL }],
  creator: "SamaDepot",
  openGraph: {
    type: "website",
    locale: "fr_SN",
    url: BASE_URL,
    siteName: "SamaDepot",
    title: "SamaDepot — Chaque devoir mérite une preuve.",
    description:
      "Dépôts horodatés, récépissés SHA-256, suivi de classe en temps réel. Remplace WhatsApp, les emails et les clés USB.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "SamaDepot — Plateforme de dépôts universitaires",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SamaDepot — Chaque devoir mérite une preuve.",
    description:
      "Dépôts horodatés, récépissés SHA-256, suivi de classe en temps réel.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
