import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // El ID puede venir como "clw...123.jpg", limpiamos la extensión si la hay
    const cleanId = id.replace(/\.(jpg|png|jpeg)$/i, '');

    const recipe = await prisma.recipe.findUnique({
      where: { id: cleanId },
      select: { imagen: true }
    });

    if (!recipe || !recipe.imagen) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // La imagen está guardada como "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const matches = recipe.imagen.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return new NextResponse("Invalid Image Data", { status: 500 });
    }

    const type = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error) {
    console.error("Error serving dynamic image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
