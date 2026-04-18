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

import Script from "next/script";

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
          src="https://www.googletagmanager.com/gtag/js?id=G-97MN0PSVTP" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-97MN0PSVTP');
          `}
        </Script>

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
        
        {/* Trust Bar: Payment & Security */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 border-b border-white/5 pb-12">
            {[
                { name: "Pago Seguro SSL", icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                )},
                { name: "Envío 24/48h", icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )},
                { name: "Garantía 14 días", icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                )},
                { name: "Atención L-V", icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                )},
                { name: "Sello JIT-Log", icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                )}
            ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-400 group hover:text-emerald-400 transition-colors">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30">
                        {item.icon}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest">{item.name}</span>
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
              Supermercado 100% vegetal operado por <strong>Jepco Consutors SL</strong>. Logística JIT para máxima frescura en alimentación ética.
            </p>
            <div className="space-y-3 text-xs text-slate-500">
               <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Avda. Salvador Espriu 38, Sentmenat (BCN)</span>
               </div>
               <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>93.145.65.80</span>
               </div>
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
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Marcas Top</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="/?marca=Terrasana" className="hover:text-primary transition-colors">Terrasana</a></li>
              <li><a href="/?marca=Solnatural" className="hover:text-primary transition-colors">Solnatural</a></li>
              <li><a href="/?marca=Vegetalia" className="hover:text-primary transition-colors">Vegetalia</a></li>
              <li><a href="/?marca=Salud%20Viva" className="hover:text-primary transition-colors">Salud Viva</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Soporte</h4>
            <ul className="space-y-3 text-sm text-slate-400 mb-6">
              <li><a href="/envios-y-devoluciones" className="hover:text-primary transition-colors">Envíos y Devoluciones</a></li>
              <li><a href="/condiciones-compra" className="hover:text-primary transition-colors">Términos de Compra</a></li>
            </ul>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[10px] text-slate-500">Pagos Seguros</h4>
            <div className="flex flex-wrap gap-2">
                {['Visa', 'MC', 'Bizum', 'Revolut'].map(p => (
                   <span key={p} className="bg-slate-800 border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                       {p}
                   </span>
                ))}
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} VeganFood.es - Cruelty-free grocery network powered by Jepco Consutors SL (B66150434).</p>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Conexión SSL Segura</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
