/**
 * Limpia una variable de entorno de residuos comunes al copiar/pegar desde .env
 * (Comillas, nombres de otras variables que se hayan colado, saltos de línea, etc.)
 */
export function cleanEnvVar(val: string | undefined): string {
    if (!val) return "";
    
    let clean = val.trim();
    
    // 1. Quitar comillas si vienen incluidas (ej: "key")
    clean = clean.replace(/^["']|["']$/g, "");
    
    // 2. Detectar si el usuario pegó el bloque entero de .env 
    //    (ej: "sk-proj-xxx AYRSHARE_API_KEY=yyy")
    //    Si hay un espacio o un salto de línea, nos quedamos con la primera parte
    const firstPart = clean.split(/[\n\r\s]/)[0];
    
    // 3. Quitar el prefijo del nombre de la variable si se pegó (ej: "OPENAI_API_KEY=xxx")
    if (firstPart.includes("=")) {
        return firstPart.split("=")[1].trim();
    }

    return firstPart.trim();
}
