import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { LEMA } from "@/lib/constants";

// La app es dinámica (auth por cookies + datos de Supabase); evitamos SSG.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portulate — candidaturas cívicas de Río Tercero",
  description: `Plataforma abierta de candidaturas para el gobierno de Río Tercero. ${LEMA}.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
          <p>
            Portulate · Río Tercero — <span className="italic text-gold">{LEMA}</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
