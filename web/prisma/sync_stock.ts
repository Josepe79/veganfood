import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log("⚡ Iniciando Sincronización Rápida de Stock (Fast-Sync)...")
  
  const dataPath = path.join(process.cwd(), '../scraper/productos_veganos.json')
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ ERROR: No se encontró la foto de stock en ${dataPath}. Ejecuta scraper.py primero.`)
    process.exit(1)
  }

  const rawData = fs.readFileSync(dataPath, 'utf8')
  const productos = JSON.parse(rawData)
  
  console.log(`📦 Se han cargado ${productos.length} referencias desde el mayorista. Comprimiendo inventario...`)

  let actualizados = 0;
  let errores = 0;
  let stockAgotadoDetectado = 0;

  // Realizamos las actualizaciones en lotes para no saturar Feliubadalo ni Postgres
  const LOTE = 50; 
  for (let i = 0; i < productos.length; i += LOTE) {
    const chunk = productos.slice(i, i + LOTE);
    
    // Procesamos en paralelo el lote actual
    await Promise.all(chunk.map(async (item: any) => {
      try {
        // En Feliubadaló identificamos fuertemente por EAN o en último caso Referencia (MPN)
        const isAgotado = item.agotado === true;
        
        let targetCondition = {};
        if (item.ean && item.ean.trim() !== "") {
            targetCondition = { ean: item.ean };
        } else if (item.ref && item.ref.trim() !== "") {
            // El modelo actual no está garantizado que tenga constraint UNIQUE en ref/ean,
            // pero `updateMany` actuará sutilmente y cambiará todos si hay repetidos.
            targetCondition = { ref: item.ref };
        } else {
            // Producto ciego, intentamos por nombre (menos fiable)
            targetCondition = { nombre: item.nombre };
        }

        const res = await prisma.product.updateMany({
            where: targetCondition,
            data: { agotado: isAgotado }
        });

        if (res.count > 0) {
            actualizados += res.count;
            if (isAgotado) stockAgotadoDetectado++;
        }
      } catch (err) {
        errores++;
      }
    }));
    
    // Progress bar logging rudimentario
    process.stdout.write(`\r🚀 Sincronizando... ${Math.min(i + LOTE, productos.length)}/${productos.length}`)
  }

  console.log(`\n\n✅ Fast-Sync Completado Exitosamente.`);
  console.log(`- 🔄 Productos localizados/modificados: ${actualizados}`);
  console.log(`- 🔴 Total referencias marcadas [Agotadas] actualmente: ${stockAgotadoDetectado}`);
  if (errores > 0) console.log(`- ⚠️ Hubo ${errores} iteraciones con errores ciegos.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
