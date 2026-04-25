import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { oculto: false },
      select: {
        id: true,
        nombre: true,
        marca: true,
        precioVenta: true,
        imagen: true,
        agotado: true,
      }
    });

    const baseUrl = "https://veganfood.es";
    
    // Generamos el XML en formato Google Merchant (RSS 2.0)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VeganFood.es - Productos Veganos</title>
    <link>${baseUrl}</link>
    <description>Feed de productos para Google Merchant Center</description>
    `;

    for (const p of products) {
      const availability = p.agotado ? "out of stock" : "in stock";
      const description = `Comprar ${p.nombre} de la marca ${p.marca || 'Vegan'}. Producto 100% vegetal con envío express.`;
      
      // Intentar extraer el peso del nombre (ej: "250g", "1kg")
      let shippingWeight = "0.25 kg"; // Valor por defecto para Google
      const weightMatch = p.nombre.match(/(\d+)\s*(g|kg|ml|l)/i);
      if (weightMatch) {
        const value = weightMatch[1];
        const unit = weightMatch[2].toLowerCase();
        shippingWeight = `${value} ${unit === 'g' || unit === 'ml' ? 'g' : 'kg'}`;
      }

      xml += `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.nombre}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${baseUrl}/product/${p.id}</g:link>
      <g:image_link>${p.imagen || 'https://veganfood.es/favicon.ico'}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.precioVenta.toFixed(2)} EUR</g:price>
      <g:brand><![CDATA[${p.marca || 'VeganFood'}]]></g:brand>
      <g:shipping_weight>${shippingWeight}</g:shipping_weight>
      <g:google_product_category>Food, Beverages &amp; Tobacco &gt; Food Items</g:google_product_category>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });

  } catch (error: any) {
    return new Response(`<error>${error.message}</error>`, { status: 500 });
  }
}
