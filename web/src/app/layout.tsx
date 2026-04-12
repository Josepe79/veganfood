import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Nav } from "@/components/Nav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeganFood.es | Tienda Vegana Online & Supermercado Express",
  description: "Comprar comida vegana a domicilio. Miles de alternativas vegetales a la carne, quesos veganos y productos refrigerados express.",
  keywords: [
    "Tienda vegana online", 
    "Comprar comida vegana a domicilio", 
    "Productos veganos refrigerados", 
    "Alternativas vegetales a la carne", 
    "Quesos veganos y tofu fresco", 
    "Supermercado vegano express"
  ],
  openGraph: {
    title: "VeganFood.es | Tu Tienda Vegana Online",
    description: "Comprar comida vegana a domicilio nunca fue tan fácil. Alternativas vegetales, quesos y tofu fresco enviado en modelo JIT.",
    url: "https://veganfood.es",
    siteName: "VeganFood",
    locale: "es_ES",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.variable} antialiased font-sans text-gray-200`}
      >
        <CartProvider>
          <Nav />
          <main className="min-h-screen container mx-auto px-4 py-8 mt-16">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">VeganFood<span className="text-primary">.es</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Tu supermercado 100% vegetal de confianza. Llevamos la mejor dietética natural y ética animal directamente a tu puerta en 24h.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">De Compras</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="/?q=semilla" className="hover:text-primary transition-colors">Superalimentos y Despensa</a></li>
              <li><a href="/?q=veg" className="hover:text-primary transition-colors">Alternativas a la Carne</a></li>
              <li><a href="/?q=queso" className="hover:text-primary transition-colors">Lácteos Vegetales</a></li>
              <li><a href="/?q=flash" className="text-purple-400/80 hover:text-purple-400 font-bold transition-colors">Ofertas Flash y Promos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Nuestras Marcas Top</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="/?marca=Heura" className="hover:text-primary transition-colors">Heura Foods</a></li>
              <li><a href="/?marca=Violife" className="hover:text-primary transition-colors">Violife (Quesos)</a></li>
              <li><a href="/?marca=Beyond%20Meat" className="hover:text-primary transition-colors">Beyond Meat</a></li>
              <li><a href="/?marca=Natursoy" className="hover:text-primary transition-colors">Natursoy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Soporte y Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="" className="hover:text-primary transition-colors block">Envíos y Devoluciones</a></li>
              <li><a href="" className="hover:text-primary transition-colors block">Guía de Nutrición Vegana</a></li>
              <li><a href="/aviso-legal" className="hover:text-primary transition-colors block">Aviso Legal y Privacidad</a></li>
              <li><a href="/condiciones-compra" className="hover:text-primary transition-colors block">Condiciones de Venta</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} VeganFood.es - Todos los derechos reservados. Cruelty-Free Business.</p>
          <div className="flex gap-4">
             <span>Pago Seguro SSL</span>
             <span>Logística JIT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
