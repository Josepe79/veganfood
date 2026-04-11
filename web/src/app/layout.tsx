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
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-20">
      <div className="container mx-auto px-4 py-8 text-center text-slate-500 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} VeganFood.es - Operado por Jepco Consutors SL.</p>
        <div className="flex gap-6">
          <a href="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</a>
          <a href="/politica-privacidad" className="hover:text-primary transition-colors">Política de Privacidad</a>
          <a href="/condiciones-compra" className="hover:text-primary transition-colors">Condiciones de Compra</a>
        </div>
      </div>
    </footer>
  )
}
