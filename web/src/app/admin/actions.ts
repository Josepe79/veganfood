"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderPreparingEmail, sendOrderShippedEmail } from "@/lib/mailer";
import { generateSocialScript } from "@/lib/social-engine/script-gen";
import { generateSocialVoice } from "@/lib/social-engine/voice-gen";
import { renderSocialVideo } from "@/lib/social-engine/video-render";
import { publishToSocial } from "@/lib/social-engine/ayrshare";
import fs from "fs";
import path from "path";


export async function marcarPedidosComoComprados() {
  try {
    // 1. Buscamos pedidos que estén en espera de compra (PENDING o PAID)
    const ordersToProcess = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PAID"] }
      }
    });

    if (ordersToProcess.length === 0) return { success: true };

    // 2. Cambiamos estado de forma masiva
    await prisma.order.updateMany({
      where: {
        id: { in: ordersToProcess.map(o => o.id) }
      },
      data: {
        status: "PROCESSING" // En preparación
      }
    });

    // 3. Disparamos correos de "En Preparación"
    ordersToProcess.forEach(order => {
      sendOrderPreparingEmail(order.customerEmail, order.id, order.customerName)
        .catch(err => console.error(`Error enviando email preparación a ${order.id}:`, err));
    });

    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    return { success: false, error: error.message };
  }
}

export async function shipOrder(orderId: string, trackingNumber: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "SHIPPED",
                trackingNumber: trackingNumber
            }
        });

        // Enviamos confirmación de envío con tracking
        await sendOrderShippedEmail(order.customerEmail, order.id, order.customerName, trackingNumber);

        revalidatePath("/admin");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.order.delete({
      where: { id: orderId }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    console.error("Error deleting order:", error);
    return { success: false, error: error.message };
  }
}

export async function hideProduct(productId: string) {
    try {
        console.log(`[Action] Hiding product: ${productId}`);
        await prisma.product.update({
            where: { id: productId },
            data: { oculto: true }
        });
        
        // Intentamos revalidar, pero si falla no dejamos que aborte la acción
        try {
            revalidatePath('/admin');
            revalidatePath('/');
        } catch (revalError) {
            console.warn(`[Action] Revalidation warn for ${productId}:`, revalError);
        }

        return { success: true };
    } catch (e: any) {
        console.error(`[Action] Error hiding product ${productId}:`, e);
        return { success: false, error: e.message || "Error desconocido al ocultar" };
    }
}

export async function updateProductPrice(productId: string, newPrice: number) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { precioVenta: newPrice }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}

export async function hideProductsBulk(productIds: string[]) {
    try {
        console.log(`[Action] Bulk hiding ${productIds.length} products`);
        await prisma.product.updateMany({
            where: { id: { in: productIds } },
            data: { oculto: true }
        });
        
        try {
            revalidatePath('/admin');
            revalidatePath('/');
        } catch (revalError) {
            console.warn(`[Action] Bulk revalidation warn:`, revalError);
        }

        return { success: true };
    } catch (e: any) {
        console.error(`[Action] Error in bulk hide:`, e);
        return { success: false, error: e.message || "Error en purga masiva" };
    }
}

export async function recoverProduct(productId: string) {
    try {
        await prisma.product.update({
            where: { id: productId },
            data: { oculto: false }
        });
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch(e: any) {
        return { success: false, error: e.message };
    }
}


/**
 * Función principal que llama la UI. Detona el trabajo en segundo plano y devuelve OK instantáneo.
 */
export async function prepareSocialMediaVideo(productId: string) {
    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error("Producto no encontrado");

        // Disparamos la generación pesada en segundo plano de manera asíncrona sin esperar
        backgroundRenderTask(productId).catch(err => {
            console.error("Fallo crítico en Worker de Segundo Plano:", err);
        });

        return { 
            success: true, 
            message: "Proceso asíncrono iniciado"
        };
    } catch (e: any) {
        console.error("Error en prepareSocialMediaVideo:", e);
        return { success: false, error: e.message };
    }
}

/**
 * Worker Asíncrono - No bloquea la UI, escribe en Base de Datos cuando termina.
 */
export async function backgroundRenderTask(productId: string) {
    const startTime = Date.now();
    console.log(`[Worker] --- INICIO PROCESO VÍDEO (${productId}) ---`);
    
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        console.error(`[Worker] Error: Producto ${productId} no encontrado en DB.`);
        return;
    }

    try {
        console.log(`[Worker] 1. Generando guion IA para: ${product.nombre}...`);
        const script = await generateSocialScript(product.nombre, product.marca || "VeganFood", product.descripcion || "");
        console.log(`[Worker] -> Guion generado con éxito.`);
        
        console.log(`[Worker] 2. Generando locución OpenAI...`);
        const voicePath = await generateSocialVoice(script.hook + " " + script.mid + " " + script.cta, `voice-${productId}.mp3`);
        console.log(`[Worker] -> Archivo de voz creado en: ${voicePath}`);
        
        console.log(`[Worker] 3. Procesando imagen del producto...`);
        let localImage = "https://online.feliubadalo.com/media/catalog/product/placeholder/default/2.png";
        const tempDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const safeLocalImagePath = path.join(tempDir, `img-${productId}.jpg`);
        try {
            const imgRes = await fetch(product.imagen || localImage, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            fs.writeFileSync(safeLocalImagePath, buffer);
            localImage = safeLocalImagePath;
            console.log(`[Worker] -> Imagen descargada localmente.`);
        } catch (e) {
            console.warn("[Worker] ! Fallo descargando la imagen, FFmpeg intentará usar URL remota.", e);
            localImage = product.imagen || localImage;
        }

        console.log(`[Worker] 4. Iniciado Renderizado FFmpeg (Superfast 480p)...`);
        const videoPath = await renderSocialVideo({
            productImage: localImage,
            voiceAudio: voicePath,
            overlays: script.overlays,
            outputName: `social-${productId}-${Date.now()}.mp4`
        });

        const publicUrl = `/temp-videos/${videoPath.split(/[\\/]/).pop()}`;
        console.log(`[Worker] 5. ¡Vídeo renderizado con éxito! URL: ${publicUrl}`);

        console.log(`[Worker] 6. Guardando resultados en Base de Datos...`);
        await prisma.product.update({
            where: { id: productId },
            data: { 
                videoUrl: publicUrl,
                captions: script.captions as any
            }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Worker] --- FIN PROCESO VÍDEO EXCITOSO (Tiempo total: ${duration}s) ---`);

    } catch (e) {
        const errorDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.error(`[Worker] !!! ERROR FATAL en generación (${productId}) tras ${errorDuration}s:`, e);
    }
}

/**
 * Publica un vídeo ya generado a Ayrshare
 */
export async function executeSocialPost(videoUrl: string, caption: string) {
    try {
        // Ayrshare requiere una URL absoluta y pública. 
        // En desarrollo localhost esto fallará si Ayrshare no puede alcanzar el server.
        const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://veganfood.es";
        const absoluteUrl = videoUrl.startsWith('http') ? videoUrl : `${DOMAIN}${videoUrl}`;

        console.log(`[Social] Publicando en redes vía Ayrshare: ${absoluteUrl}`);
        const result = await publishToSocial(absoluteUrl, caption);
        
        return { success: true, result };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
