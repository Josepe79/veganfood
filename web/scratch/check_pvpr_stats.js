const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Cargar .env manualmente
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
}

const prisma = new PrismaClient();

async function main() {
    console.log("📊 Analizando el catálogo de productos en la DB...");

    const totalProducts = await prisma.product.count();
    
    // Contar cuántos tienen PVPR "Libre" o vacío
    const libreProducts = await prisma.product.count({
        where: {
            OR: [
                { pvpr: "Libre" },
                { pvpr: "" },
                { pvpr: null }
            ]
        }
    });

    // Contar cuántos tienen un PVPR con un precio numérico real (se guarda como string pero que represente un precio)
    // El seed.ts procesa el PVPR y extrae el valor flotante. Si pvprVal > 0 lo usa.
    // Vamos a buscar cuántos productos tienen margen de 0.10 (que son los calculados por defecto)
    const defaultMarginProducts = await prisma.product.count({
        where: { margen: 0.10 }
    });

    console.log(`- Total de productos en la base de datos: ${totalProducts}`);
    console.log(`- Productos con PVPR "Libre" o sin especificar: ${libreProducts} (${((libreProducts/totalProducts)*100).toFixed(2)}%)`);
    console.log(`- Productos con margen actual del 10% (por defecto): ${defaultMarginProducts} (${((defaultMarginProducts/totalProducts)*100).toFixed(2)}%)`);
    
    // Veamos una muestra de 5 productos con margen 0.10
    const sample = await prisma.product.findMany({
        where: { margen: 0.10 },
        take: 5,
        select: { nombre: true, precioOriginal: true, precioVenta: true, pvpr: true }
    });

    console.log("\n📋 Muestra de productos con margen 10%:");
    sample.forEach(p => {
        console.log(`  • ${p.nombre.substring(0, 50)}...`);
        console.log(`    Costo B2B: ${p.precioOriginal}€ | PVP Web: ${p.precioVenta}€ | PVPR: "${p.pvpr}"`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
