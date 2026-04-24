import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlatosVeganos.es | Recetas Saludables y Sostenibles",
  description: "Descubre las mejores recetas veganas paso a paso. Cocina con ingredientes de calidad de VeganFood.es y transforma tu alimentación.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} antialiased font-sans`}>
        <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">PlatosVeganos<span className="text-primary">.es</span></span>
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
              <a href="/" className="hover:text-primary transition-colors">Inicio</a>
              <a href="#" className="hover:text-primary transition-colors">Categorías</a>
              <a href="#" className="hover:text-primary transition-colors">Lo más nuevo</a>
              <a href="https://veganfood.es" className="bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all">Ir a la Tienda</a>
            </nav>
          </div>
        </header>
        <main className="pt-24 min-h-screen">
          {children}
        </main>
        <footer className="border-t border-white/5 bg-slate-950 py-12 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} PlatosVeganos.es - Una iniciativa de VeganFood.es</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
