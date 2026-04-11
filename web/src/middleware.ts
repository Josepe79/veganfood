import { NextRequest, NextResponse } from "next/server";

// Esto fuerza a que el middleware SOLO vigile la ruta secreta y sus variantes
export const config = {
  matcher: ['/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    try {
        const authValue = authHeader.split(" ")[1];
        const decodedValue = atob(authValue); // atob() es nativo en Edge V8
        const [user, pwd] = decodedValue.split(":");

        // Lee de las variables de Railway, si no hay asume "admin" por defecto para no romper local
        const expectedUser = process.env.ADMIN_USER || "admin";
        const expectedPassword = process.env.ADMIN_PASSWORD || "Veganfood2024$";

        if (user === expectedUser && pwd === expectedPassword) {
          return NextResponse.next(); // Identidad correcta, se abren las puertas
        }
    } catch (e) {
        // Fallo en la decodificación, se ignora para forzar el pop-up de nuevo
    }
  }

  // Si no hay cabecera o la clave es incorrecta, mostramos el cartelito nativo pidiendo Login.
  return new NextResponse("Authentication Required - Acceso Denegado", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Centro Regional Logistic"',
    },
  });
}
