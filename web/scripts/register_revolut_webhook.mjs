const REVOLUT_KEY = "sk_1lP2H4SxzpldWrTd6u3YRpewtYs8S7vRr-XUxcIwEubjgjtqv8k9Hz9a7Bn8Pito";

const headers = {
  "Authorization": `Bearer ${REVOLUT_KEY}`,
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Revolut-Api-Version": "2024-09-01"
};

async function listWebhooks() {
  console.log("📋 Webhooks ya registrados:");
  const r = await fetch("https://merchant.revolut.com/api/1.0/webhooks", { headers });
  const data = await r.text();
  console.log(`Status: ${r.status}`, data);
}

async function registerWebhook() {
  console.log("\n🔧 Registrando webhook...");
  const r = await fetch("https://merchant.revolut.com/api/1.0/webhooks", {
    method: "POST",
    headers,
    body: JSON.stringify({
      url: "https://veganfood.es/api/webhook/revolut",
      events: ["ORDER_COMPLETED"]
    })
  });
  const data = await r.text();
  if (r.ok) {
    console.log("✅ Webhook registrado:", data);
  } else {
    console.log(`❌ Error ${r.status}:`, data);
  }
}

async function main() {
  await listWebhooks();
  await registerWebhook();
}

main().catch(console.error);
