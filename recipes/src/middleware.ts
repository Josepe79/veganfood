import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    try {
        const authValue = authHeader.split(" ")[1];
        const decodedValue = atob(authValue);
        const [user, pwd] = decodedValue.split(":");

        const expectedUser = process.env.ADMIN_USER || "admin";
        const expectedPassword = process.env.ADMIN_PASSWORD || "Veganfood2024$";

        if (user === expectedUser && pwd === expectedPassword) {
          return NextResponse.next();
        }
    } catch (e) {
    }
  }

  return new NextResponse("Authentication Required - Acceso Denegado", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Platos Veganos Admin"',
    },
  });
}
