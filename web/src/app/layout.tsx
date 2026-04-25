import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Nav } from "@/components/Nav";
import Script from "next/script";
import { CookieBanner } from "@/components/CookieBanner";

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
  },
  verification: {
    google: "BYQHLBfGBlPNRzwq1g8yKJ7crReS8d1Pge-hpYg5zV0",
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
        {/* Google tag (gtag.js) */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-38EEPDDN41" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-38EEPDDN41');
          `}
        </Script>

        <CartProvider>
          <Nav />
          <main className="min-h-screen container mx-auto px-4 py-8 mt-16">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-20">
      
      {/* Top Trust Bar - Google Merchant Specific */}
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 py-4">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span>Pago Seguro SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <span>Envío Express 24/48h</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
            <span>Productos Origen UE</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-black text-xl">V</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tighter italic">VeganFood<span className="text-emerald-500">.es</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tu supermercado vegano de confianza operado por <strong>Jepco Consultors SL</strong>. Alimentación ética, sostenible y con entrega express.
            </p>
            <div className="flex gap-4">
               {/* Redes sociales con iconos */}
               <a href="https://www.instagram.com/veganfoosspain/" target="_blank" className="text-slate-500 hover:text-emerald-400 transition-colors">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Atención Cliente</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><a href="/contacto" className="hover:text-emerald-400 transition-colors">Centro de Soporte</a></li>
              <li><a href="/envios-y-devoluciones" className="hover:text-emerald-400 transition-colors">Envíos y Devoluciones</a></li>
              <li><a href="/condiciones-compra" className="hover:text-emerald-400 transition-colors">Condiciones de Compra</a></li>
              <li><a href="/politica-privacidad" className="hover:text-emerald-400 transition-colors">Política de Privacidad</a></li>
              <li><a href="/aviso-legal" className="hover:text-emerald-400 transition-colors">Aviso Legal</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Información</h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              <li><a href="/sobre-nosotros" className="hover:text-emerald-400 transition-colors">Nuestra Historia</a></li>
              <li><a href="https://platosveganos.es" target="_blank" className="hover:text-emerald-400 transition-colors">Recetas PlatosVeganos</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest text-emerald-500">Datos Fiscales</h4>
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Titular de la web</p>
              <p className="text-white text-sm font-medium">Jepco Consutors SL</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">NIF / CIF</p>
              <p className="text-white text-sm font-medium tracking-widest">B66150434</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Sede Social y Logística</p>
              <p className="text-slate-400 text-[11px] leading-relaxed italic">
                Avda. Salvador Espriu 38, <br />
                08181 Sentmenat (Barcelona)<br />
                Telf: 93.145.65.80
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} VeganFood.es - Cruelty-Free Grocery Network
          </p>
          <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-3" />
          </div>
        </div>
      </div>
    </footer>
  )
}
