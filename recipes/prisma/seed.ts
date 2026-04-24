import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seeder inteligente (Upsert)...")
  
  // ELIMINADO: await prisma.product.deleteMany() -> Ya no borramos la BD para proteger datos.

  // Leer productos (Priorizar JSON Completo del Deep Scrape Nocturno)
  let dataPath = path.join(process.cwd(), '../scraper/productos_completos.json')
  
  if (!fs.existsSync(dataPath)) {
    console.warn(`WARNING: No se encontró el json completo en ${dataPath}. Usando listado simple.`)
    dataPath = path.join(process.cwd(), '../scraper/productos_veganos.json')
  }
  
  if (!fs.existsSync(dataPath)) {
    console.error(`ERROR: No se encontró ningún JSON. Ejecuta scraper.py primero.`)
    return
  }

  const rawData = fs.readFileSync(dataPath, 'utf8')
  const productos = JSON.parse(rawData)
  
  let insertados = 0
  let actualizados = 0

  for (const item of productos) {
    let cleanB2b = item.precio_b2b.replace('€', '').replace(',', '.').trim()
    let originalCost = parseFloat(cleanB2b)
    if (isNaN(originalCost)) originalCost = 0.0

    let pvprVal = 0;
    if (item.pvpr && item.pvpr.toLowerCase() !== 'libre') {
       let cleanPvpr = item.pvpr.replace('€', '').replace(',', '.').trim()
       pvprVal = parseFloat(cleanPvpr)
       if(isNaN(pvprVal)) pvprVal = 0;
    }

    let calculatedSalePrice = 0;
    let finalMargin = 0.10;

    if (pvprVal > 0) {
       calculatedSalePrice = pvprVal;
       if (originalCost > 0) {
          finalMargin = (calculatedSalePrice - originalCost) / originalCost;
       }
    } else {
       calculatedSalePrice = originalCost * (1 + finalMargin);
    }

    const agotado = item.agotado === true

    // Buscar si el producto ya existe (Prioridad: EAN > Ref > Nombre)
    let searchCondition = {};
    if (item.ean && item.ean.trim() !== "") {
        searchCondition = { ean: item.ean };
    } else if (item.ref && item.ref.trim() !== "") {
        searchCondition = { ref: item.ref };
    } else {
        searchCondition = { nombre: item.nombre };
    }

    try {
        const existing = await prisma.product.findFirst({ where: searchCondition });

        if (existing) {
            // ACTUALIZAR SEGURA: Solo tocamos precios base y stock. No tocamos descripciones de IA ni precios de venta manuales.
            await prisma.product.update({
                where: { id: existing.id },
                data: {
                    precioOriginal: originalCost,
                    pvpr: item.pvpr || "",
                    agotado: agotado,
                    isNuevo: item.is_nuevo || false
                }
            });
            actualizados++;
        } else {
            // INSERCIÓN NUEVA: Producto recién detectado en Feliubadaló
            await prisma.product.create({
              data: {
                nombre: item.nombre,
                marca: item.marca,
                ean: item.ean || "",
                ref: item.ref || "",
                precioOriginal: originalCost,
                margen: finalMargin,
                precioVenta: calculatedSalePrice,
                pvpr: item.pvpr || "",
                agotado: agotado,
                imagen: item.imagen || "",
                urlOriginal: item.url_original || null,
                isNuevo: item.is_nuevo || false,
                // Insertamos descripciones vírgenes (B2B) para que luego la IA las reescriba
                descripcion: item.descripcion || null,
                ingredientes: item.ingredientes || null
              }
            });
            insertados++;
        }
    } catch (e) {
        console.error(`Error procesando [${item.nombre}]:`, e);
    }
  }

  console.log(`¡Sincronización Inteligente JIT completada!`)
  console.log(`- Nuevos productos insertados al catálogo: ${insertados}`);
  console.log(`- Productos actualizados (Precios/Stock): ${actualizados}`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
