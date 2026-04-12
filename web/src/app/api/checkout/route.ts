import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, cartItems, totalAmount } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    // 1. Guardar la orden inicial en estado PENDING en PostgreSQL (SQLite en config local)
    const order = await prisma.order.create({
      data: {
        customerName: customer.nombre,
        customerEmail: customer.email,
        customerPhone: customer.telefono,
        address: customer.direccion,
        totalAmount: totalAmount,
        status: "PENDING",
        items: {
          create: cartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    if (!process.env.REVOLUT_SECRET_KEY) {
      throw new Error("REVOLUT_SECRET_KEY no está configurada en el servidor.");
    }

    const isSandbox = process.env.REVOLUT_SECRET_KEY.startsWith('sand_');
    const baseUrl = isSandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com";

    const originUrl = req.headers.get("origin") || "https://veganfood.es";

    // Llamada oficial a Revolut Merchant API
    const revolutResponse = await fetch(`${baseUrl}/api/1.0/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REVOLUT_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(totalAmount * 100), // En céntimos
        currency: "EUR",
        merchant_order_ext_ref: order.id,
        customer_email: customer.email,
        description: `VeganFood - Compra #${order.id.slice(-6)}`,
        redirect_url: `${originUrl}/success`
      })
    });

    if (!revolutResponse.ok) {
      const errorText = await revolutResponse.text();
      console.error("Revolut Error:", errorText);
      throw new Error("Fallo al contactar con la pasarela bancaria.");
    }

    const data = await revolutResponse.json();
    
    // Guardamos el token identificador de revolut de vuelta en nuestra base de datos
    await prisma.order.update({
      where: { id: order.id },
      data: { revolutOrderId: data.id }
    });

    // Devolvemos la URL segura al frontend
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      checkout_url: data.checkout_url
    }, { status: 200 });

  } catch (error: any) {
    console.error("Order Creation Error", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
