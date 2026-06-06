"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendOrderPreparingEmail, sendOrderShippedEmail, sendOrderCancelledEmail } from "@/lib/mailer";
import { generateSocialScript } from "@/lib/social-engine/script-gen";
import { generateSocialVoice } from "@/lib/social-engine/voice-gen";
import { renderSocialVideo } from "@/lib/social-engine/video-render";
import { publishToSocial } from "@/lib/social-engine/ayrshare";
import { publishRecipeToSocial } from "@/lib/social-engine/ayrshare-recipes";
import { publishRecipeVideoToSocial } from "@/lib/social-engine/ayrshare-recipes-video";
import fs from "fs";
import path from "path";
import ffmpegInstaller from "ffmpeg-static";
import { getFfmpegPath } from "@/lib/social-engine/env-cleanup";


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

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateOrderAddress(orderId: string, address: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { address }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
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
 * Worker Asíncrono - No bloquea la UI, escribe en Base de Datos cuando termina.
 */
/**
 * FASE 1: Generación de Guion y Voz (Esencial y rápido)
 * Se ejecuta de forma síncrona en la API para asegurar persistencia.
 */
export async function generateVideoMetadata(productId: string) {
    console.log(`[Worker] --- FASE 1: Iniciando Metadata (${productId}) ---`);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Producto no encontrado");

    console.log(`[Worker] 1. Generando guion IA para: ${product.nombre}...`);
    const script = await generateSocialScript(product.nombre, product.marca || "VeganFood", product.descripcion || "");
    
    console.log(`[Worker] 2. Generando locución OpenAI...`);
    const voicePath = await generateSocialVoice(script.hook + " " + script.mid + " " + script.cta, `voice-${productId}.mp3`);

    console.log(`[Worker] 3. Guardando Captions en DB...`);
    await prisma.product.update({
        where: { id: productId },
        data: { captions: script.captions as any }
    });

    return { script, voicePath, product };
}

/**
 * FASE 2: Renderizado de Vídeo (Pesado)
 * Se dispara en segundo plano.
 */
export async function backgroundRenderTask(productId: string, script: any, voicePath: string, product: any) {
    const startTime = Date.now();
    console.log(`[Worker] --- FASE 2: Iniciando Renderizado (${productId}) ---`);

    try {
        // Marcamos en base de datos que estamos renderizando (para que el UI lo sepa)
        await prisma.product.update({
            where: { id: productId },
            data: { videoUrl: "STATUS:RENDERING" }
        });

        const initialStaticPath = (ffmpegInstaller as any)?.default || ffmpegInstaller;
        const ffmpegPath = getFfmpegPath(initialStaticPath);
        
        console.log(`[Worker] 4. Procesando imagen del producto...`);
        let localImage = "https://online.feliubadalo.com/media/catalog/product/placeholder/default/2.png";
        const tempDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "tmp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const safeLocalImagePath = path.join(tempDir, `img-${productId}.jpg`);
        try {
            const imgRes = await fetch(product.imagen || localImage, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            fs.writeFileSync(safeLocalImagePath, buffer);
            localImage = safeLocalImagePath;
        } catch (e) {
            console.warn("[Worker] ! Fallo descargando imagen, usando fallback.");
            localImage = product.imagen || localImage;
        }

        console.log(`[Worker] 5. Renderizado FFmpeg activo...`);
        const videoPath = await renderSocialVideo({
            productImage: localImage,
            voiceAudio: voicePath,
            overlays: script.overlays,
            outputName: `social-${productId}-${Date.now()}.mp4`
        });

        const fileName = videoPath.split(/[\\/]/).pop();
        const publicUrl = `/api/admin/video/stream?file=${fileName}`;
        console.log(`[Worker] 6. Finalizado. URL de Streaming: ${publicUrl}`);

        await prisma.product.update({
            where: { id: productId },
            data: { videoUrl: publicUrl }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Worker] --- FIN EXITOSO (${duration}s) ---`);

    } catch (e: any) {
        console.error(`[Worker] !!! ERROR FATAL en fase 2 (${productId}):`, e);
        // PERSISTENCIA DEL ERROR: Para que no se quede el bucle de "Montando"
        try {
            await prisma.product.update({
                where: { id: productId },
                data: { videoUrl: `STATUS:ERROR:${e.message || "Fallo desconocido"}` }
            });
        } catch (dbError) {
            console.error("[Worker] Error crítico intentando guardar estado de error en DB.");
        }
    }
}

/**
 * Publica un vídeo ya generado a Ayrshare
 */
export async function executeSocialPost(videoUrl: string, caption: string) {
    try {
        const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://veganfood.es";
        const absoluteUrl = videoUrl.startsWith('http') ? videoUrl : `${DOMAIN}${videoUrl}`;

        console.log(`[Social] Publicando en redes vía Ayrshare: ${absoluteUrl}`);
        const result = await publishToSocial(absoluteUrl, caption);
        
        return { success: true, result };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function publishRecipeAction(recipeId: string) {
    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) throw new Error("Receta no encontrada");
        if (!recipe.imagen) throw new Error("La receta no tiene imagen generada");
        if (!recipe.socialCopy) throw new Error("La receta no tiene texto para redes (socialCopy)");

        const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://veganfood.es";
        const publicImageUrl = `${DOMAIN}/api/image/${recipe.id}.jpg`;

        console.log(`[Social Recipe] Publicando receta en Ayrshare: ${recipe.nombre} con URL ${publicImageUrl}`);
        const result = await publishRecipeToSocial(publicImageUrl, recipe.socialCopy);
        
        if (result.errors && result.errors.length > 0) {
            return { success: false, error: JSON.stringify(result.errors) };
        }
        if (result.status === "error") {
            return { success: false, error: result.message || "Error desconocido en Ayrshare" };
        }

        // Opcional: Marcar como publicado en redes
        return { success: true, result };
    } catch (e: any) {
        console.error("Error publicando receta:", e);
        return { success: false, error: e.message };
    }
}

export async function publishRecipeVideoAction(recipeId: string) {
    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) throw new Error("Receta no encontrada");
        if (!recipe.videoUrl || recipe.videoUrl.startsWith("STATUS:")) throw new Error("La receta no tiene un vídeo válido renderizado");
        if (!recipe.socialCopy) throw new Error("La receta no tiene texto para redes (socialCopy)");

        const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://veganfood.es";
        const absoluteVideoUrl = recipe.videoUrl.startsWith('http') ? recipe.videoUrl : `${DOMAIN}${recipe.videoUrl}`;

        console.log(`[Social Recipe] Publicando VÍDEO en Ayrshare: ${recipe.nombre} con URL ${absoluteVideoUrl}`);
        const result = await publishRecipeVideoToSocial(absoluteVideoUrl, recipe.socialCopy);
        
        if (result.errors && result.errors.length > 0) {
            return { success: false, error: JSON.stringify(result.errors) };
        }
        if (result.status === "error") {
            return { success: false, error: result.message || "Error desconocido en Ayrshare" };
        }

        return { success: true, result };
    } catch (e: any) {
        console.error("Error publicando VÍDEO de receta:", e);
        return { success: false, error: e.message };
    }
}

export async function backgroundRecipeRenderTask(recipeId: string, voiceScript: string, autoPublish: boolean = false) {
    const startTime = Date.now();
    console.log(`[Recipe Worker] --- FASE 2: Iniciando Renderizado de Vídeo de Receta (${recipeId}) ---`);

    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }});
        if(!recipe) throw new Error("Receta no encontrada");

        console.log(`[Recipe Worker] 1. Generando locución OpenAI...`);
        const voicePath = await generateSocialVoice(voiceScript, `recipe-voice-${recipeId}.mp3`);

        console.log(`[Recipe Worker] 2. FFmpeg Render Activo...`);
        const tempDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "tmp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const localImagePath = path.join(tempDir, `recipe-img-${recipeId}.jpg`);
        const base64Data = recipe.imagen.split(',')[1] || recipe.imagen;
        fs.writeFileSync(localImagePath, Buffer.from(base64Data, "base64"));
        
        const overlays = [
            { text: recipe.nombre, time: 0 },
            { text: "¡Súper fácil y 100% Vegano!", time: 3 },
            { text: "Receta completa en descripción", time: 6 },
            { text: "Ingredientes en veganfood.es", time: 9 }
        ];

        const videoPath = await renderSocialVideo({
            productImage: localImagePath,
            voiceAudio: voicePath,
            overlays: overlays,
            outputName: `recipe-${recipeId}-${Date.now()}.mp4`
        });

        const fileName = videoPath.split(/[\\/]/).pop();
        const publicUrl = `/api/admin/video/stream?file=${fileName}`;

        await prisma.recipe.update({
            where: { id: recipeId },
            data: { videoUrl: publicUrl }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[Recipe Worker] --- FIN EXITOSO (${duration}s) --- URL: ${publicUrl}`);

        if (autoPublish) {
            console.log(`[Recipe Worker] Auto-publicando en redes...`);
            await publishRecipeVideoAction(recipeId);
        }
    } catch(e: any) {
        console.error(`[Recipe Worker] !!! ERROR FATAL:`, e);
        try {
            await prisma.recipe.update({
                where: { id: recipeId },
                data: { videoUrl: `STATUS:ERROR:${e.message}` }
            });
        } catch (dbError) {}
    }
}

export async function startRecipeVideoRender(recipeId: string) {
    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!recipe) throw new Error("Receta no encontrada");
        
        // Marcamos como renderizando ANTES de devolver la respuesta al cliente
        await prisma.recipe.update({
            where: { id: recipeId },
            data: { videoUrl: "STATUS:RENDERING" }
        });

        // Script dinámico super llamativo (no usamos Gemini para ganar velocidad, lo montamos nosotros)
        const voiceScript = `¡Hoy preparamos un increíble ${recipe.nombre}! Totalmente vegano y súper fácil. La receta paso a paso está en la descripción, y puedes comprar todos los ingredientes frescos en la tienda online de veganfood punto es. ¡Haz click en el enlace de nuestra biografía!`;

        // Disparo "Fire and Forget" protegido del Garbage Collector de Next.js
        setTimeout(() => {
            backgroundRecipeRenderTask(recipeId, voiceScript, false).catch(console.error);
        }, 50);

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function captureRevolutOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.revolutOrderId) throw new Error("Order not found or no Revolut ID");

    const isSandbox = process.env.REVOLUT_SECRET_KEY?.startsWith('sand_');
    const baseUrl = isSandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com";

    const revolutResponse = await fetch(`${baseUrl}/api/1.0/orders/${order.revolutOrderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REVOLUT_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: Math.round(order.totalAmount * 100) })
    });

    if (!revolutResponse.ok) {
      throw new Error(`Revolut capture failed: ${await revolutResponse.text()}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    console.error("Capture Error:", error);
    return { success: false, error: error.message };
  }
}

export async function cancelRevolutOrderAction(orderId: string) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.revolutOrderId) throw new Error("Order not found or no Revolut ID");

    const isSandbox = process.env.REVOLUT_SECRET_KEY?.startsWith('sand_');
    const baseUrl = isSandbox ? "https://sandbox-merchant.revolut.com" : "https://merchant.revolut.com";

    const revolutResponse = await fetch(`${baseUrl}/api/1.0/orders/${order.revolutOrderId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REVOLUT_SECRET_KEY}`,
        "Content-Type": "application/json",
      }
    });

    if (!revolutResponse.ok) {
        const errorText = await revolutResponse.text();
        console.warn(`Revolut cancel returned: ${errorText}`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    sendOrderCancelledEmail(order.customerEmail, order.id, order.customerName)
        .catch(err => console.error("Error enviando email de cancelación:", err));

    revalidatePath("/admin");
    return { success: true };
  } catch(error: any) {
    console.error("Cancel Error:", error);
    return { success: false, error: error.message };
  }
}
