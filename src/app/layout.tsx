import type { Metadata, Viewport } from "next";
import { Jost } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Armario",
  description: "Tu armario digital y generador de outfits",
  appleWebApp: { capable: true, title: "Armario", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jost.variable} font-sans antialiased`}>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
