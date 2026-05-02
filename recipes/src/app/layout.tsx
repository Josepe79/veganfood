import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://platosveganos.es'),
  title: "PlatosVeganos.es | Recetas Saludables y Sostenibles",
  description: "Descubre las mejores recetas veganas paso a paso. Cocina con ingredientes de calidad de VeganFood.es y transforma tu alimentación.",
  alternates: {
    canonical: '/',
  }
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
        <footer className="border-t border-white/5 bg-slate-950/50 mt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-white font-black text-xl mb-4 italic tracking-tighter">PlatosVeganos<span className="text-primary">.es</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Inspiración culinaria 100% vegetal para tu día a día. 
                  Parte del ecosistema <a href="https://veganfood.es" className="text-white hover:text-primary transition-colors">VeganFood.es</a>.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Información Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="/aviso-legal" className="text-slate-400 hover:text-white transition-colors">Aviso Legal</a></li>
                  <li><a href="/politica-privacidad" className="text-slate-400 hover:text-white transition-colors">Política de Privacidad</a></li>
                  <li><a href="/contacto" className="text-slate-400 hover:text-white transition-colors">Contacto</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Ecosistema</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="https://veganfood.es" className="text-slate-400 hover:text-white transition-colors">Tienda Online</a></li>
                  <li><a href="https://veganfood.es/sobre-nosotros" className="text-slate-400 hover:text-white transition-colors">Sobre Nosotros</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-500 text-xs">© 2026 Operado por <a href="https://www.jepco.es" target="_blank" className="hover:text-primary transition-colors">Jepco</a></p>
              <div className="flex gap-6">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Powered by VeganFood Technology</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
