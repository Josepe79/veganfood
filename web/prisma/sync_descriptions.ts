import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando inyección de descripciones seguras...");
  const dataPath = path.join(process.cwd(), '../scraper/productos_completos.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`ERROR CRÍTICO: No se encontró la base de datos rica en ${dataPath}. Abortando para proteger los datos.`);
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf8');
  const productos = JSON.parse(rawData);
  
  let inyectados = 0;
  let no_encontrados = 0;
  let sin_descripcion = 0;

  for (const item of productos) {
    if (!item.descripcion || item.descripcion.trim() === "") {
        sin_descripcion++;
        continue;
    }

    // LIMPIEZA B2B PREVENTIVA
    let cleanDesc = item.descripcion || "";
    const B2B_PATTERNS = [
        /En Feliubadal.*/gi,
        /excelente opci[óo]n para que tiendas.*/gi,
        /punto de venta/gi,
        /canal profesional/gi,
        /precios profesionales/gi,
        /tiendas especializadas/gi,
        /alta rotaci[óo]n/gi,
        /distribuci[óo]n/gi
    ];
    for (const pattern of B2B_PATTERNS) {
        cleanDesc = cleanDesc.replace(pattern, "");
    }
    cleanDesc = cleanDesc.trim();

    try {
        const existing = await prisma.product.findFirst({
            where: item.ean ? { ean: item.ean } : { ref: item.ref }
        });

        if (existing) {
            // ACTUALIZAR SEGURA: Solo tocamos precios base y stock. No tocamos descripciones de IA ni precios de venta manuales.
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    precioOriginal: item.precioOriginal,
                    pvpr: item.pvpr || "",
                    agotado: item.agotado,
                    isNuevo: item.is_nuevo || false,
                    formato: item.formato || ""
                }
            });
            inyectados++;
        } else {
            // INSERCIÓN NUEVA: Producto recién detectado en Feliubadaló
            await prisma.product.create({
              data: {
                nombre: item.nombre,
                marca: item.marca,
                ean: item.ean || "",
                ref: item.ref || "",
                precioOriginal: item.precioOriginal,
                margen: item.margen,
                precioVenta: item.precioVenta,
                pvpr: item.pvpr || "",
                agotado: item.agotado,
                imagen: item.imagen || "",
                urlOriginal: item.url_original || null,
                isNuevo: item.is_nuevo || false,
                // Insertamos descripciones saneadas (B2C)
                descripcion: cleanDesc || null,
                ingredientes: item.ingredientes || null,
                formato: item.formato || null
              }
            });
            no_encontrados++;
        }
    } catch (e) {
        console.error(`Fallo actualizando producto ${item.nombre}:`, e);
    }
  }

  console.log("=========================================");
  console.log(`✓ EXITOSO: ${inyectados} descripciones ricas inyectadas.`);
  console.log(`- Sin descripción detectada en Feliubadaló: ${sin_descripcion}`);
  console.log(`- Productos desincronizados (No hallados en la DB): ${no_encontrados}`);
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });
