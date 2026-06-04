const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Cargar .env manualmente
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Quitar comillas si las hay
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if (value.startsWith("'") && value.endsWith("'")) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

console.log("Testeando conexión SMTP con:", process.env.SMTP_HOST, process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "ssl0.ovh.net",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function main() {
    try {
        const info = await transporter.sendMail({
            from: `"VeganFood Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER || "veganfood@jepco.es",
            subject: "Prueba SMTP desde script local",
            text: "Este es un correo de prueba para verificar las credenciales SMTP de OVH.",
        });
        console.log("✅ Correo enviado con éxito. ID:", info.messageId);
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
    }
}

main();
