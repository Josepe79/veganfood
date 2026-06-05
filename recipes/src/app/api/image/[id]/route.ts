import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const id = p.id;
    
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { imagen: true }
    });

    if (!recipe || !recipe.imagen) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (recipe.imagen.startsWith("http")) {
      return NextResponse.redirect(recipe.imagen);
    }

    if (recipe.imagen.startsWith("data:image/jpeg;base64,") || recipe.imagen.startsWith("data:image/png;base64,")) {
      const base64Data = recipe.imagen.replace(/^data:image\/(jpeg|png);base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': recipe.imagen.includes("jpeg") ? 'image/jpeg' : 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }

    return new NextResponse("Invalid format", { status: 400 });
  } catch (error) {
    console.error("Image serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
