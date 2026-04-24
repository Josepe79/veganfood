import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://platosveganos.es';

  // 1. Páginas estáticas
  const staticPages = [
    '',
    '/aviso-legal',
    '/politica-privacidad',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // 2. Páginas de recetas dinámicas
  const recipes = await prisma.recipe.findMany({
    where: { publicado: true },
    select: { slug: true, updatedAt: true },
  });

  const recipePages = recipes.map((recipe) => ({
    url: `${baseUrl}/receta/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...recipePages];
}
