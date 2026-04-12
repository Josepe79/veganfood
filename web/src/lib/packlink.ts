interface PacklinkOrder {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  address?: string | null;
  totalAmount: number;
}

export async function createPacklinkDraft(order: PacklinkOrder) {
  if (!process.env.PACKLINK_API_KEY) {
    console.warn("⚠️ API Key de Packlink no configurada. Saltando registro logístico.");
    return;
  }

  // Intentar extraer el código postal (CP) de la dirección en texto plano (e.j. 5 dígitos)
  const zipMatch = order.address?.match(/\b\d{5}\b/);
  const zipCode = zipMatch ? zipMatch[0] : "08000"; // Fallback a Barcelona genérico si falla

  const payload = {
    platform: "PRO",
    platform_country: "ES",
    from: {
      name: process.env.SENDER_NAME || "VeganFood Logistics",
      company: process.env.SENDER_COMPANY || "Jepco Consutors SL",
      street1: process.env.SENDER_STREET || "Calle de la Empresa 1",
      zip_code: process.env.SENDER_ZIP || "08001",
      city: process.env.SENDER_CITY || "Barcelona",
      country: "ES",
      phone: process.env.SENDER_PHONE || "+34600000000",
      email: process.env.SENDER_EMAIL || "veganfood@jepco.es"
    },
    to: {
      name: order.customerName,
      last_name: ".", // Mandatory field in some versions
      street1: order.address || "Recogida Local",
      zip_code: zipCode,
      city: "Asignar en Panel", // Forced manual verification if parsing is hard
      country: "ES",
      phone: order.customerPhone || "000000000",
      email: order.customerEmail
    },
    packages: [
      {
        weight: 3.5,    // Default estimado en Kg
        width: 30,      // Default estimado en cm
        height: 20,
        length: 20
      }
    ],
    content: "Alimentación Vegana Especializada",
    contentvalue: order.totalAmount,
    source: "CORE_VEGANFOOD_API"
  };

  try {
    const response = await fetch("https://api.packlink.com/v1/shipments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.PACKLINK_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error creando borrador en Packlink:", errorData);
      throw new Error(`Packlink API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🚀 Envío borrador creado en Packlink exitosamente! Ref: ${data.reference}`);
    return data;
  } catch (error) {
    console.error("Fallo crítico comunicando con Packlink:", error);
  }
}
