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
