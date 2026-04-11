import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seeder...")
  
  // Limpiar bd actual
  await prisma.product.deleteMany()
  console.log("Base de datos de productos reseteada.")

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
  
  let parseados = 0

  for (const item of productos) {
    // Parsear precio b2b
    // Feliubadalo devuelve algo como "4,30 €" o "4,30"
    let cleanB2b = item.precio_b2b.replace('€', '').replace(',', '.').trim()
    let originalCost = parseFloat(cleanB2b)
    
    if (isNaN(originalCost)) {
      originalCost = 0.0
    }

    // Parsear PVPR (Precio Venta Público Recomendado)
    let pvprVal = 0;
    if (item.pvpr && item.pvpr.toLowerCase() !== 'libre') {
       let cleanPvpr = item.pvpr.replace('€', '').replace(',', '.').trim()
       pvprVal = parseFloat(cleanPvpr)
       if(isNaN(pvprVal)) pvprVal = 0;
    }

    // Lógica de Precios del Cliente:
    // Si hay un PVPR válido, lo usamos. Si no, aplicamos 10% de margen al costo original.
    let calculatedSalePrice = 0;
    let finalMargin = 0.0;

    if (pvprVal > 0) {
       calculatedSalePrice = pvprVal;
       if (originalCost > 0) {
          finalMargin = (calculatedSalePrice - originalCost) / originalCost;
       }
    } else {
       finalMargin = 0.10;
       calculatedSalePrice = originalCost * (1 + finalMargin);
    }

    // Ajustar agotado
    const agotado = item.agotado === true

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
        descripcion: item.descripcion || null,
        ingredientes: item.ingredientes || null
      }
    })
    parseados++
  }

  console.log(`¡Seeder completado! Se han insertado ${parseados} productos veganos al catálogo, con un margen dinámico aplicado del 10%.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
