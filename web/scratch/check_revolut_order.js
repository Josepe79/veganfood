const fs = require('fs');
const path = require('path');

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

const secretKey = process.env.REVOLUT_SECRET_KEY;
if (!secretKey) {
    console.error("❌ Falta REVOLUT_SECRET_KEY en el .env");
    process.exit(1);
}

const isSandbox = secretKey.startsWith('sand_');
const baseUrl = isSandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com";

const revolutOrderId = "6a163588-0072-a6c8-b863-6972d1afe668";

async function checkOrder() {
    console.log(`Consultando orden en Revolut (${isSandbox ? "Sandbox" : "Producción"})...`);
    console.log(`URL: ${baseUrl}/api/1.0/orders/${revolutOrderId}`);
    try {
        const response = await fetch(`${baseUrl}/api/1.0/orders/${revolutOrderId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${secretKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`❌ Error en la API de Revolut (Status ${response.status}):`, errText);
            return;
        }

        const data = await response.json();
        console.log("✅ Datos de la orden en Revolut:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("❌ Error de red/fetching:", e);
    }
}

checkOrder();
