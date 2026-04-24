import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

/**
 * MASTER SYNC - VeganFood Novedades & Strategy
 * Este script orquestra toda la inteligencia de negocio para las novedades.
 */
async function main() {
    console.log("==================================================");
    console.log("🌟 INICIANDO MASTER SYNC NOCTURNO (Novedades) 🌟");
    console.log("==================================================");

    try {
        // 1. IMPORTACIÓN Y ETIQUETADO
        console.log("\n[1/3] Sincronizando catálogo con el último Scrape...");
        // Usamos tsx directamente para invocar el seed
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

        // 2. INTELIGENCIA COMPETITIVA
        // Solo escaneamos productos marcados como NUEVOS para optimizar créditos de SerpAPI
        console.log("\n[2/3] Escaneando precios de competencia para NOVEDADES...");
        // Notar: He diseñado sync_prices para priorizar isNuevo de serie, 
        // pero aquí forzamos que el motor se concentre en ellos si hay muchos.
        execSync('npx tsx prisma/sync_prices.ts', { stdio: 'inherit' });

        // 3. OPTIMIZACIÓN DE COPYWRITING IA
        console.log("\n[3/3] Generando descripciones B2C para nuevos productos...");
        // El reescritor ya filtra por isAiGenerated: false
        execSync('npx tsx prisma/rewrite_catalog.ts', { stdio: 'inherit' });

        console.log("\n==================================================");
        console.log("✅ MASTER SYNC COMPLETADO CON ÉXITO");
        console.log("Mañana tendrás el Admin listo para decidir ofertas.");
        console.log("==================================================");

    } catch (error: any) {
        console.error("\n❌ ERROR CRÍTICO EN EL MASTER SYNC:");
        console.error(error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
