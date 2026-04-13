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
