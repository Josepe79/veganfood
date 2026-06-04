// Script para consultar tarifas Packlink y crear envíos para los pedidos PAID con dirección completa

const PACKLINK_KEY = process.env.PACKLINK_API_KEY || "a43f8c6c566f9302e35969d75d5826496ba744572d57a5c75d8ad6af3bfb1c0c";
const FROM_ZIP = "08181"; // Sentmenat (origen)
const FROM_COUNTRY = "ES";

const orders = [
  {
    label: "Belen Hostalet",
    orderId: "cmp85tft2000065h3ysypic9m",
    toZip: "08036",
    toCity: "Barcelona",
    toCountry: "ES",
    toName: "Belen Hostalet",
    toStreet: "Carrer D'Aribau 175, 1-1-a",
    toPhone: "679550209",
    toEmail: "belen@belenhostalet.com",
    weight: 3,    // 3 bricks de 1L ≈ 3kg
    width: 30, height: 20, length: 20,
    content: "Bebida Vegetal Avena Barista Bio 1L x3",
    value: 13.96
  },
  {
    label: "Luz Dary",
    orderId: "cmpb4ieyj000h65h3pcdw1ccs",
    toZip: "36900",
    toCity: "Marín",
    toCountry: "ES",
    toName: "Luz Dary Marrero Martínez",
    toStreet: "Calle Jaime Janer N54 3C",
    toPhone: "674251430",
    toEmail: "luzdarymarreromartinez@gmail.com",
    weight: 0.2,  // Té Matcha 30g → muy ligero
    width: 10, height: 10, length: 10,
    content: "Te Matcha Reserve 30g",
    value: 35.57
  }
];

async function getQuotes(order: typeof orders[0]) {
  const params = new URLSearchParams({
    "from[country]": FROM_COUNTRY,
    "from[zip]": FROM_ZIP,
    "to[country]": order.toCountry,
    "to[zip]": order.toZip,
    "packages[0][weight]": String(order.weight),
    "packages[0][width]": String(order.width),
    "packages[0][height]": String(order.height),
    "packages[0][length]": String(order.length),
    "source": "PRO"
  });

  const res = await fetch(`https://api.packlink.com/v1/services?${params}`, {
    headers: { "Authorization": PACKLINK_KEY }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Packlink error ${res.status}: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log(`\n📦 CONSULTA DE TARIFAS PACKLINK\n${"─".repeat(70)}`);

  for (const order of orders) {
    console.log(`\n👤 ${order.label} → ${order.toZip} ${order.toCity} | ${order.weight}kg`);
    console.log(`   Producto: ${order.content}`);
    try {
      const services = await getQuotes(order);
      if (!Array.isArray(services) || services.length === 0) {
        console.log("   ⚠️ No hay servicios disponibles.");
        continue;
      }

      // Ordenar por precio
      const sorted = services.sort((a: any, b: any) => a.price?.total_price - b.price?.total_price);
      console.log(`   ${"─".repeat(60)}`);
      console.log(`   ${"TRANSPORTISTA".padEnd(25)} ${"SERVICIO".padEnd(20)} ${"PRECIO".padStart(8)} ${"DÍAS".padStart(5)}`);
      console.log(`   ${"─".repeat(60)}`);
      sorted.slice(0, 5).forEach((s: any) => {
        const carrier = (s.carrier_name || s.name || "—").slice(0, 24).padEnd(25);
        const service = (s.service_name || s.transit_days?.toString() || "—").slice(0, 19).padEnd(20);
        const price = `${s.price?.total_price?.toFixed(2) ?? "?"}€`.padStart(8);
        const days = `${s.transit_days ?? "?"}d`.padStart(5);
        console.log(`   ${carrier} ${service} ${price} ${days}`);
      });

      // Marcar el más barato
      const cheapest = sorted[0];
      const precio = cheapest?.price?.total_price?.toFixed(2);
      const cobra = order.value;
      const diferencia = cobra - (Number(precio) || 0) - (cobra - 4.99); // Los 4.99€ que cobró
      console.log(`\n   💡 Opción más barata: ${cheapest?.carrier_name} — ${precio}€`);
      console.log(`   💶 Cliente pagó 4.99€ de envío — ${Number(precio) <= 4.99 ? "✅ Cubierto" : `⚠️  Diferencia: ${(Number(precio) - 4.99).toFixed(2)}€ a tu cargo`}`);

    } catch (e: any) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  }

  console.log(`\n${"─".repeat(70)}`);
  console.log("Ejecuta fix_send_packlink.ts para crear los borradores en Packlink.");
}

main().catch(console.error);
