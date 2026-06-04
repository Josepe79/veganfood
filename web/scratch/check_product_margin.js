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
    const ean = "3800048225789";
    console.log(`🔍 Buscando producto con EAN: ${ean} en la DB...`);
    const product = await prisma.product.findFirst({
        where: { ean }
    });

    if (!product) {
        console.log("❌ Producto no encontrado.");
        return;
    }

    console.log("✅ Producto encontrado:");
    console.log(JSON.stringify(product, null, 2));

    const totalVenta = 92.95;
    const unidades = 25;
    const pvpUnitarioCobrado = totalVenta / unidades; // 3.718
    const costeB2BUnitario = product.precioOriginal; // precioOriginal es el Costo B2B
    const costeB2BTotal = costeB2BUnitario * unidades;
    const beneficioNeto = totalVenta - costeB2BTotal;
    const margenReal = (beneficioNeto / totalVenta) * 100;

    console.log(`\n📊 Análisis de Margen para este pedido (25 uds):`);
    console.log(`- PVP Unitario cobrado al cliente: ${pvpUnitarioCobrado.toFixed(2)}€`);
    console.log(`- Costo B2B Unitario (Feliubadaló): ${costeB2BUnitario.toFixed(2)}€`);
    console.log(`- Costo B2B Total (para 25 uds):     ${costeB2BTotal.toFixed(2)}€`);
    console.log(`- Total cobrado al cliente (PVP):   ${totalVenta.toFixed(2)}€`);
    console.log(`- Beneficio bruto:                   ${beneficioNeto.toFixed(2)}€`);
    console.log(`- Margen real sobre venta:          ${margenReal.toFixed(2)}%`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
