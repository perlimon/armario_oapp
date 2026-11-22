import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

// Solo para el logotipo "MyStyle".
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "MyStyle",
  description: "Tu armario digital y generador de outfits",
  appleWebApp: { capable: true, title: "MyStyle", statusBarStyle: "default" },
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
      <body className={`${jost.variable} ${cormorant.variable} font-sans antialiased`}>
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
