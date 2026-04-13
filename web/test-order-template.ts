import { sendOrderConfirmationEmail } from "./src/lib/mailer";

async function runTemplateTest() {
    console.log("Iniciando prueba de plantilla de confirmación de pedido...");
    
    // Datos de prueba realistas
    const testData = {
        email: "veganfood@jepco.es", // Enviamos a tu cuenta para verificar
        orderId: "ord_test_882299",
        name: "Usuario de Prueba VeganFood",
        amount: 54.32
    };

    try {
        const result = await sendOrderConfirmationEmail(
            testData.email,
            testData.orderId,
            testData.name,
            testData.amount
        );

        if (result) {
            console.log("✅ ¡Plantilla enviada con éxito! Revisa tu bandeja de entrada en veganfood@jepco.es");
            console.log("Deberías ver el diseño con el logo y el resumen del pedido.");
        } else {
            console.log("❌ Hubo un problema al enviar la plantilla. Revisa los logs de error.");
        }
    } catch (error) {
        console.error("Fallo crítico en el test de plantilla:", error);
    }
}

runTemplateTest();
