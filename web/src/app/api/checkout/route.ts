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

    // 2. Aquí conectaríamos con Revolut Merchant API
    // Revolut Flow: 
    // const revolutResponse = await fetch("https://sandbox-merchant.revolut.com/api/1.0/orders", {
    //   headers: { "Authorization": `Bearer ${process.env.REVOLUT_SECRET_KEY}` }, ...
    // })
    // const data = await revolutResponse.json();
    // const revolutPublicId = data.public_id;
    // await prisma.order.update({ where: { id: order.id }, data: { revolutOrderId: data.id } });

    // FIX: Simulamos el token público de revolut para probar
    const fakeRevolutPublicId = `rev_pub_${Math.random().toString(36).substring(7)}`;
    
    // Devolvemos el ID de Revolut para que el Frontend inyecte el Widget de tarjeta
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      public_id: fakeRevolutPublicId
    }, { status: 200 });

  } catch (error: any) {
    console.error("Order Creation Error", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
