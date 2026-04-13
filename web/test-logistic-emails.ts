import { sendOrderPreparingEmail, sendOrderShippedEmail } from "./src/lib/mailer";

async function runLogisticTests() {
    console.log("🚀 Iniciando suite de pruebas logísticas...");

    const testOrder = {
        id: "cl_jit_order_9988",
        email: "veganfood@jepco.es",
        name: "Experto en Logística JIT",
        tracking: "PK_ES_334455667788"
    };

    console.log("\n1. Probando email de PREPARACIÓN...");
    const prepResult = await sendOrderPreparingEmail(testOrder.email, testOrder.id, testOrder.name);
    if (prepResult) {
        console.log("✅ Email de preparación enviado.");
    }

    console.log("\n2. Probando email de ENVÍO (+ Tracking)...");
    const shipResult = await sendOrderShippedEmail(testOrder.email, testOrder.id, testOrder.name, testOrder.tracking);
    if (shipResult) {
        console.log("✅ Email de envío enviado.");
    }

    console.log("\n--- PRUEBAS FINALIZADAS ---");
    console.log("Revisa tu bandeja de entrada para validar los dos nuevos diseños.");
}

runLogisticTests();
