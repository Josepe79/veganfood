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
  title: "VeganFood.es | Catálogo Vegano B2B",
  description: "Plataforma de E-Commerce dinámica con integración Just-In-Time a Feliubadaló.",
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
