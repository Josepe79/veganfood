const fs = require('fs');
const path = require('path');

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
const headers = {
  "Authorization": `Bearer ${secretKey}`,
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Revolut-Api-Version": "2024-09-01"
};

async function listWebhooks() {
  console.log("Consultando webhooks en Revolut...");
  const r = await fetch("https://merchant.revolut.com/api/1.0/webhooks", { headers });
  const data = await r.json();
  console.log("Webhooks activos:", JSON.stringify(data, null, 2));
}

listWebhooks().catch(console.error);
