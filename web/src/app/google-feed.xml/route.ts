import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Escapar caracteres especiales para XML estricto
const escapeXml = (unsafe: string) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

export const dynamic = "force-dynamic"; // El catálogo muta frecuentemente

export async function GET() {
  try {
    // Obtenemos solo los productos NO ocultos
    const products = await prisma.product.findMany({
      where: { oculto: false },
      orderBy: { updatedAt: "desc" }
    });

    const DOMAIN = "https://veganfood.es";

    // Iniciamos la envoltura oficial RSS 2.0 con los namespaces de Google
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VeganFood España</title>
    <link>${DOMAIN}</link>
    <description>Catálogo principal del Supermercado 100% Vegano VeganFood.es</description>
`;

    // Empaquetamos cada nodo dinámicamente
    products.forEach((product) => {
      // Calculamos disponibilidad
      const availability = product.agotado ? "out of stock" : "in stock";
      
      // Fallback de imagen a un placeholder si no hay
      const imageLink = product.imagen && product.imagen.startsWith("http") 
        ? escapeXml(product.imagen) 
        : "https://online.feliubadalo.com/media/catalog/product/placeholder/default/2.png";

      const title = escapeXml(product.nombre).slice(0, 149); // Google rechaza titles > 150 chars
      const description = escapeXml(product.descripcion || product.nombre).slice(0, 4000);
      
      const price = `${product.precioVenta.toFixed(2)} EUR`;

      xml += `    <item>
      <g:id>${product.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${DOMAIN}/product/${product.id}</g:link>
      <g:image_link>${imageLink}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${escapeXml(product.marca || "VeganFood")}</g:brand>
`;

      // Si tenemos su EAN original (Código de Barras), lo inyectamos para destruir competencia
      if (product.ean && product.ean.length > 5) {
         xml += `      <g:gtin>${escapeXml(product.ean)}</g:gtin>\n`;
      } else {
         // Si no tiene EAN/GTIN válido, según la doc se inyecta g:identifier_exists
         xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
      }

      xml += `    </item>\n`;
    });

    // Cerramos encapsulado
    xml += `  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate" // CDN cache por 1H para no machacar DB excesivamente
      },
    });
  } catch (error) {
    console.error("Error construyendo Google XML Feed:", error);
    return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><error>Internal Server Error</error>", {
      status: 500,
      headers: { "Content-Type": "text/xml" },
    });
  }
}
