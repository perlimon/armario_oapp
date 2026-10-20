import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import { Sesion } from "@/components/Sesion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Armario",
  description: "Tu armario digital y generador de outfits",
  appleWebApp: { capable: true, title: "Armario", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Sesion>{children}</Sesion>
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
