

import nodemailer from 'nodemailer';

async function test() {
    console.log("Testeando conexión SMTP con:", process.env.SMTP_HOST, process.env.SMTP_USER);

    const transporterTest = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "",
        port: 465,
        secure: true, // SSL/TLS 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const targetEmail = process.env.SMTP_USER || "veganfood@jepco.es";  
    
    console.log(`Enviando email de prueba a: ${targetEmail}...`);
    const success = await transporterTest.sendMail({
        from: targetEmail,
        to: targetEmail,
        subject: "VeganFood TEST 587",
        text: "It works"
    }).then(() => true).catch(err => {
        console.error("Test Transporter Error:", err);
        return false;
    });
    
    if (success) {
        console.log("✅ EL CORREO HA SIDO ENVIADO PERFECTAMENTE. Revisa la bandeja de entrada.");
    } else {
        console.error("❌ FALLO AL ENVIAR. Revisa las contraseñas, el puerto (465 o 587) o las directivas de seguridad de tu proveedor OVH.");
    }
}

test();
