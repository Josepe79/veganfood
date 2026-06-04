import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Basic auth check using a bearer token matching a local secret
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    const body = await req.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload, expected array of products' }, { status: 400 });
    }

    console.log(`[Webhook] Recibidos ${body.length} productos para sincronizar stock.`);

    let actualizados = 0;
    let errores = 0;
    let stockAgotadoDetectado = 0;

    // Process in batches
    const LOTE = 50; 
    for (let i = 0; i < body.length; i += LOTE) {
      const chunk = body.slice(i, i + LOTE);
      
      await Promise.all(chunk.map(async (item: any) => {
        try {
          const isAgotado = item.agotado === true;
          let targetCondition = {};
          
          if (item.ean && item.ean.trim() !== "") {
              targetCondition = { ean: item.ean };
          } else if (item.ref && item.ref.trim() !== "") {
              targetCondition = { ref: item.ref };
          } else {
              targetCondition = { nombre: item.nombre };
          }

          const res = await prisma.product.updateMany({
              where: targetCondition,
              data: { agotado: isAgotado }
          });

          if (res.count > 0) {
              actualizados += res.count;
              if (isAgotado) stockAgotadoDetectado++;
          }
        } catch (err) {
          errores++;
        }
      }));
    }

    console.log(`[Webhook] Sincronización finalizada. Actualizados: ${actualizados}, Agotados: ${stockAgotadoDetectado}, Errores: ${errores}`);
    return NextResponse.json({ success: true, actualizados, stockAgotadoDetectado, errores });

  } catch (error: any) {
    console.error('[Webhook] Error sincronizando stock:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
