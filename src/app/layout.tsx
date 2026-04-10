import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "VentIA Interview",
  description: "Herramienta interna de entrevistas técnicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-grid min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
