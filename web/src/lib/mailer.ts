import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
    },
});

export async function sendOrderConfirmationEmail(emailTo: string, orderId: string, customerName: string, amount: number) {
    try {
        const mailOptions = {
            from: `"VeganFood Store" <${process.env.SMTP_USER}>`,
            to: emailTo,
            subject: `¡Confirmación de tu pedido en VeganFood! (#${orderId.substring(0, 8).toUpperCase()})`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://veganfood.es/logo.png" alt="VeganFood Logo" style="max-width: 150px; border-radius: 8px;">
                    </div>
                    <h2 style="color: #2e7d32; text-align: center;">¡Gracias por tu compra, ${customerName}! 🌱</h2>
                    
                    <p style="color: #424242; font-size: 16px; line-height: 1.5;">
                        Tu pedido ha sido confirmado con éxito y ya estamos preparando el envío con el distribuidor. 
                    </p>
                    
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border-left: 5px solid #2e7d32; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Resumen de tu Orden #<span style="font-family: monospace;">${orderId.substring(0, 8).toUpperCase()}</span></h3>
                        <p style="margin: 5px 0; color: #555;"><strong>Email asociado:</strong> ${emailTo}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Importe total pagado:</strong> <span style="font-size: 18px; color: #1b5e20; font-weight: bold;">${amount.toFixed(2)}€</span></p>
                        <p style="margin: 5px 0; color: #555;"><strong>Estado:</strong> Pagado / Procesando logística 📦</p>
                    </div>

                    <p style="color: #757575; font-size: 14px; text-align: center;">
                        Si tienes alguna duda o necesitas asistencia rápida con tu pedido, por favor responde directamente a este correo o escríbenos a soporte.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    
                    <p style="text-align: center; color: #9e9e9e; font-size: 12px;">
                        VeganFood España &copy; ${new Date().getFullYear()} - Comprometidos con una distribución consciente.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado exitosamente a ${emailTo} (Info ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error("Fallo general enviando email transaccional (Nodemailer): ", error);
        return false;
    }
}

export async function sendOrderPreparingEmail(emailTo: string, orderId: string, customerName: string) {
    try {
        const mailOptions = {
            from: `"VeganFood Team" <${process.env.SMTP_USER}>`,
            to: emailTo,
            subject: `Tu pedido #${orderId.substring(0, 8).toUpperCase()} ya está en preparación 🥦`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://veganfood.es/logo.png" alt="VeganFood Logo" style="max-width: 150px;">
                    </div>
                    <h2 style="color: #43a047;">¡Buenas noticias, ${customerName}!</h2>
                    <p style="color: #424242; font-size: 16px;">
                        Acabamos de solicitar tus productos a nuestro centro de distribución JIT. 
                        Tu pedido <strong>#${orderId.substring(0, 8).toUpperCase()}</strong> ya está siendo empaquetado y preparado con mucho mimo.
                    </p>
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0; color: #2e7d32; font-weight: bold;">Estado: En Preparación 📦</p>
                    </div>
                    <p style="color: #757575; font-size: 14px;">Te avisaremos en cuanto el transportista recoja el paquete.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error("Error enviando email de preparación:", e);
        return false;
    }
}

export async function sendOrderShippedEmail(emailTo: string, orderId: string, customerName: string, trackingNumber: string) {
    try {
        const trackingUrl = `https://pro.packlink.es/tracking/${trackingNumber}`; // Ajustar si usas otro transportista
        const mailOptions = {
            from: `"VeganFood Envíos" <${process.env.SMTP_USER}>`,
            to: emailTo,
            subject: `¡Tu pedido ya va de camino! 🚚 (#${orderId.substring(0, 8).toUpperCase()})`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://veganfood.es/logo.png" alt="VeganFood Logo" style="max-width: 150px;">
                    </div>
                    <h2 style="color: #1a237e;">¡Ya ha salido!</h2>
                    <p style="color: #424242; font-size: 16px;">
                        Tu pedido <strong>#${orderId.substring(0, 8).toUpperCase()}</strong> ha sido entregado al transportista y va directo a tu casa.
                    </p>
                    <div style="background-color: #e8eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #1a237e;"><strong>Código de seguimiento:</strong> ${trackingNumber}</p>
                        <a href="${trackingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1a237e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Seguir mi pedido</a>
                    </div>
                    <p style="color: #757575; font-size: 14px; text-align: center;">¡Gracias por confiar en VeganFood!</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error("Error enviando email de envío:", e);
        return false;
    }
}

export interface OrderItemDetail {
    productName: string;
    quantity: number;
    price: number;
}

export async function sendAdminNewOrderEmail(
    orderId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string | null | undefined,
    address: string | null | undefined,
    totalAmount: number,
    items: OrderItemDetail[]
) {
    const adminEmail = process.env.SMTP_USER || "veganfood@jepco.es";

    const itemsRows = items.map(item => `
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #333;">${item.productName}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center; color: #333;">${item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; color: #333; font-weight: bold;">${(item.price * item.quantity).toFixed(2)}€</td>
        </tr>
    `).join("");

    try {
        const mailOptions = {
            from: `"VeganFood Sistema" <${adminEmail}>`,
            to: adminEmail,
            subject: `🛒 NUEVO PEDIDO #${orderId.substring(0, 8).toUpperCase()} — ${customerName} — ${totalAmount.toFixed(2)}€`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 650px; margin: 0 auto; border: 2px solid #2e7d32; border-radius: 10px; background-color: #f9fff9;">
                    <h2 style="color: #2e7d32; margin-top: 0;">🛒 Nuevo Pedido Recibido y Pagado</h2>
                    <p style="color: #555; font-size: 15px;">Se ha confirmado el pago del siguiente pedido. Entra al <a href="https://veganfood.es/admin" style="color: #2e7d32;">panel de admin</a> para gestionarlo en Feliubadaló.</p>

                    <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1b5e20; border-bottom: 2px solid #e8f5e9; padding-bottom: 10px;">📦 Pedido #${orderId.substring(0, 8).toUpperCase()}</h3>

                        <h4 style="color: #555; margin-bottom: 8px;">👤 Datos del Cliente</h4>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr><td style="padding: 5px 10px; color: #888; width: 130px;"><strong>Nombre:</strong></td><td style="padding: 5px 10px; color: #333;">${customerName}</td></tr>
                            <tr><td style="padding: 5px 10px; color: #888;"><strong>Email:</strong></td><td style="padding: 5px 10px; color: #333;"><a href="mailto:${customerEmail}" style="color: #2e7d32;">${customerEmail}</a></td></tr>
                            <tr><td style="padding: 5px 10px; color: #888;"><strong>Teléfono:</strong></td><td style="padding: 5px 10px; color: #333;">${customerPhone || "—"}</td></tr>
                            <tr><td style="padding: 5px 10px; color: #888;"><strong>Dirección:</strong></td><td style="padding: 5px 10px; color: #333;">${address || "—"}</td></tr>
                        </table>

                        <h4 style="color: #555; margin-bottom: 8px;">🛍️ Productos</h4>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #e8f5e9;">
                                    <th style="padding: 8px 12px; text-align: left; color: #2e7d32;">Producto</th>
                                    <th style="padding: 8px 12px; text-align: center; color: #2e7d32;">Uds.</th>
                                    <th style="padding: 8px 12px; text-align: right; color: #2e7d32;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>${itemsRows}</tbody>
                            <tfoot>
                                <tr style="background-color: #f1f8e9;">
                                    <td colspan="2" style="padding: 10px 12px; font-weight: bold; color: #1b5e20;">TOTAL PAGADO</td>
                                    <td style="padding: 10px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #1b5e20;">${totalAmount.toFixed(2)}€</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <p style="text-align: center; margin-top: 20px;">
                        <a href="https://veganfood.es/admin" style="display: inline-block; padding: 12px 28px; background-color: #2e7d32; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">👉 Ir al Panel Admin</a>
                    </p>

                    <p style="color: #bbb; font-size: 11px; text-align: center; margin-top: 20px;">VeganFood Sistema — Notificación automática</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email de nuevo pedido enviado al admin (${adminEmail})`);
        return true;
    } catch (e) {
        console.error("Error enviando email de notificación al admin:", e);
        return false;
    }
}

export async function sendOrderCancelledEmail(emailTo: string, orderId: string, customerName: string) {
    try {
        const mailOptions = {
            from: `"VeganFood Team" <${process.env.SMTP_USER}>`,
            to: emailTo,
            subject: `Información sobre tu pedido #${orderId.substring(0, 8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://veganfood.es/logo.png" alt="VeganFood Logo" style="max-width: 150px;">
                    </div>
                    <h2 style="color: #d32f2f;">Hola, ${customerName}</h2>
                    <p style="color: #424242; font-size: 16px;">
                        Lamentamos informarte de que tu pedido <strong>#${orderId.substring(0, 8).toUpperCase()}</strong> ha sido cancelado debido a falta de stock u otras incidencias logísticas.
                    </p>
                    <p style="color: #424242; font-size: 16px;">
                        La retención de fondos en tu tarjeta ha sido <strong>liberada inmediatamente</strong>. Dependiendo de tu banco, es posible que el cargo desaparezca de tus movimientos en las próximas horas. No se te ha cobrado ninguna cantidad.
                    </p>
                    <p style="color: #757575; font-size: 14px;">Si tienes cualquier duda, responde directamente a este correo. Disculpa las molestias.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error('Error enviando email de cancelación:', e);
        return false;
    }
}
