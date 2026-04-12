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

    try {
        // En lugar de borrar todo y crear de cero, hacemos update cruzando por 'ean' o 'ref' si ean no existe.
        // Asumiendo que Prisma permite findFirst para ean
        const targetTarget = await prisma.product.findFirst({
            where: item.ean ? { ean: item.ean } : { ref: item.ref }
        });

        if (targetTarget) {
            await prisma.product.update({
                where: { id: targetTarget.id },
                data: {
                    descripcion: item.descripcion,
                    ingredientes: item.ingredientes || null
                }
            });
            inyectados++;
        } else {
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
