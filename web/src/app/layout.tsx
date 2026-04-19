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
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        
        {/* Trust Bar: Payment & Security */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 border-b border-white/5 pb-12">
            {[
                { name: "Pago Seguro SSL", icon: (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                )},
                { name: "Envío 24/48h", icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )},
                { name: "Garantía 14 días", icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                )},
                { name: "Atención L-V", icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                )},
                { name: "Sello Vegano", icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                )}
            ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-400 group hover:text-emerald-400 transition-all duration-300">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 group-hover:scale-110">
                        {item.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">VeganFood<span className="text-primary">.es</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Supermercado 100% vegetal operado por <strong>Jepco Consutors SL</strong>. Logística JIT para máxima frescura en alimentación ética y sostenible.
            </p>
            <div className="flex gap-4 mb-6">
               <a href="https://www.instagram.com/veganfoosspain/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </a>
               <a href="https://www.tiktok.com/@veganfood.es" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.776 8.776 0 01-1.87-1.41v11.41c.02 1.08-.23 2.19-.75 3.14a6.494 6.494 0 01-3.67 3.2c-1.22.38-2.52.48-3.79.29-1.73-.24-3.39-1.12-4.59-2.4a7.126 7.126 0 01-1.63-4.74c.13-1.85.99-3.64 2.45-4.83a6.892 6.892 0 014.28-1.55c.12 0 .23 0 .35.01v4.03a3.52 3.52 0 00-2.31 1.1c-.81.82-1.22 2.01-1.14 3.16.1 1.18.7 2.29 1.64 2.97.97.71 2.25.9 3.4.52 1.34-.45 2.26-1.76 2.26-3.17V0l.01.02z"/></svg>
               </a>
               <a href="https://www.youtube.com/@VeganFoodSpain" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
               </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Empresa</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="/sobre-nosotros" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="/contacto" className="hover:text-primary transition-colors">Contacto</a></li>
              <li><a href="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</a></li>
              <li><a href="/politica-privacidad" className="hover:text-primary transition-colors">Privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Información</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="/envios-y-devoluciones" className="hover:text-primary transition-colors">Envíos y Devoluciones</a></li>
              <li><a href="/condiciones-compra" className="hover:text-primary transition-colors">Términos de Compra</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Pagos Seguros</h4>
            <div className="flex flex-wrap gap-2 mb-6">
                {['Visa', 'Mastercard', 'Bizum', 'PayPal'].map(p => (
                   <span key={p} className="bg-slate-800 border border-white/10 rounded px-2.5 py-1 text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                       {p}
                   </span>
                ))}
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 leading-normal mb-0 italic">
                  Todos los pagos están cifrados bajo el estándar PCI-DSS de nivel 1 cumpliendo con las máximas garantías de seguridad bancaria española.
                </p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-slate-500 text-xs">
          <div className="text-left">
            <p className="font-bold text-slate-400 mb-1">© {new Date().getFullYear()} VeganFood.es - Cruelty-free grocery network</p>
            <p>Operado por Gepco Consultors SL · NIF: B66150434 · Avda. Salvador Espriu 38, 08213 Sentmenat (Barcelona)</p>
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-1.5 text-emerald-500/80 font-bold border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Sello JIT: Logística 24h</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
