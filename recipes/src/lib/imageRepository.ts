export interface RecipeImage {
  id: string;
  tags: string[];
  category: 'sweet' | 'salty' | 'beverage';
}

const IMAGE_REPOSITORY: RecipeImage[] = [
  // --- DULCES (Galletas, Brownies, Trufas, Tartas) ---
  { id: "photo-1499636136210-6f4ee915583e", tags: ["galletas", "cookies", "chocolate"], category: 'sweet' },
  { id: "photo-1558961363-fa8fdf82db35", tags: ["galletas", "almendras", "cookies", "vainilla"], category: 'sweet' },
  { id: "photo-1548365328-8c6af42220d0", tags: ["brownie", "chocolate", "crema-cacahuete", "bizcocho"], category: 'sweet' },
  { id: "photo-1606313564200-e75d5e30476c", tags: ["brownie", "cacao", "chocolate-blanco"], category: 'sweet' },
  { id: "photo-1541783245831-57d6fb0926d3", tags: ["trufas", "chocolate", "bolitas"], category: 'sweet' },
  { id: "photo-1600326145359-3a4dc92f254e", tags: ["mousse", "chocolate", "crema-dulce", "postre"], category: 'sweet' },
  { id: "photo-1587314168485-3236d6710814", tags: ["tarta", "pastel", "mermelada", "naranja"], category: 'sweet' },

  // --- SALADOS (Sopas, Bowls, Lasañas, Pizzas, Ensaladas) ---
  { id: "photo-1547592166-23ac45744acd", tags: ["sopa", "crema-calabaza", "bowl-caliente"], category: 'salty' },
  { id: "photo-1512621776951-a57141f2eefd", tags: ["ensalada", "quinoa", "bowl-frio", "verduras"], category: 'salty' },
  { id: "photo-1555939594-58d7cb561ad1", tags: ["ensalada", "tomate", "lechuga"], category: 'salty' },
  { id: "photo-1565557623262-b51c2513a641", tags: ["pizza", "horno", "tomate"], category: 'salty' },
  { id: "photo-1619881589316-56c7f9e6b587", tags: ["lasaña", "pasta", "bechamel", "horneado"], category: 'salty' },

  // --- BEBIDAS (Smoothies) ---
  { id: "photo-1623065422902-30a2d299bbe4", tags: ["smoothie", "bowl-frutas", "acai", "desayuno"], category: 'beverage' },
];

export function getBestImageForRecipe(title: string, ingredients: string): string {
  const normalizedTitle = title.toLowerCase();
  
  // 1. Determinar la categoría estricta
  let targetCategory: 'sweet' | 'salty' | 'beverage' = 'salty';
  if (normalizedTitle.includes('galleta') || normalizedTitle.includes('brownie') || 
      normalizedTitle.includes('trufa') || normalizedTitle.includes('mousse') || 
      normalizedTitle.includes('tarta') || normalizedTitle.includes('pastel') || 
      normalizedTitle.includes('chocolate')) {
    targetCategory = 'sweet';
  } else if (normalizedTitle.includes('smoothie') || normalizedTitle.includes('batido')) {
    targetCategory = 'beverage';
  }

  // 2. Filtrar repositorio por categoría estricta para evitar cruces (ej. crema de sopa vs crema de cacahuete)
  const categoryPool = IMAGE_REPOSITORY.filter(img => img.category === targetCategory);
  
  // 3. Puntuación semántica
  const scoredImages = categoryPool.map(img => {
    let score = 0;
    img.tags.forEach(tag => {
      // Tags compuestos (crema-calabaza -> crema de calabaza)
      const cleanTag = tag.replace('-', ' ');
      if (normalizedTitle.includes(cleanTag)) score += 3;
      else if (ingredients.toLowerCase().includes(cleanTag)) score += 1;
    });
    return { id: img.id, score };
  });

  // 4. Seleccionar ganadores (Top Scorer)
  scoredImages.sort((a, b) => b.score - a.score);
  const maxScore = scoredImages[0].score;
  const topCandidates = scoredImages.filter(img => img.score === maxScore);
  
  // 5. Variedad aleatoria entre los mejores candidatos
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  
  return `https://images.unsplash.com/${selected.id}?q=80&w=2070&auto=format&fit=crop`;
}
