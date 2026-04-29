export interface RecipeImage {
  id: string;
  tags: string[];
}

export const IMAGE_REPOSITORY: RecipeImage[] = [
  // 🍝 PASTA & FIDEOS
  { id: 'photo-1473093295043-cdd812d0e601', tags: ['pasta', 'fideos', 'espaguetis', 'macarrones', 'italiano', 'tallarines', 'noodles'] },
  { id: 'photo-1551183053-8d6d7e2e58c8', tags: ['pasta', 'tomate', 'boloñesa', 'salsa', 'penne'] },
  { id: 'photo-1621996316220-4384a6c42171', tags: ['lasaña', 'horno', 'gratinado', 'capas', 'queso'] },
  
  // 🥗 ENSALADAS & BOWLS
  { id: 'photo-1512621776951-a57141f2eefd', tags: ['ensalada', 'bowl', 'fresco', 'verde', 'lechuga', 'espinacas', 'aguacate', 'salad'] },
  { id: 'photo-1540189549336-e6e99c3679fe', tags: ['ensalada', 'quinoa', 'tomates', 'cherry', 'fresco', 'saludable'] },
  { id: 'photo-1490645935967-10de6ba17061', tags: ['bowl', 'buda', 'verduras', 'garbanzos', 'zanahoria', 'colorido'] },
  
  // 🍲 GUISOS, SOPAS & CURRYS
  { id: 'photo-1547592166-23ac45744acd', tags: ['sopa', 'crema', 'caldo', 'cuchara', 'caliente', 'invierno', 'calabaza'] },
  { id: 'photo-1540914124281-342729441458', tags: ['curry', 'guiso', 'estofado', 'salsa', 'picante', 'arroz', 'asiatico', 'leche de coco'] },
  { id: 'photo-1548943487-a2e4f43b4850', tags: ['crema', 'pure', 'verde', 'espinacas', 'calabacin'] },
  
  // 🍪 POSTRES & DULCES
  { id: 'photo-1499636136210-6f4ee915583e', tags: ['galletas', 'cookies', 'horno', 'dulce', 'merienda', 'postre'] },
  { id: 'photo-1495147466023-0650b25e1eb9', tags: ['chocolate', 'cacao', 'brownie', 'tarta', 'pastel', 'dulce'] },
  { id: 'photo-1550617931-e17a7b70dce2', tags: ['tarta', 'pastel', 'frutas', 'fresa', 'arandanos', 'bizcocho'] },
  
  // 🥤 BEBIDAS & SMOOTHIES
  { id: 'photo-1505252585461-04db1eb84625', tags: ['batido', 'smoothie', 'fruta', 'vaso', 'fresco', 'desayuno', 'liquido'] },
  { id: 'photo-1505576399279-565b52d4ac71', tags: ['zumo', 'jugo', 'naranja', 'verde', 'detox', 'bebida'] },
  
  // 🍔 BURGERS & FAST FOOD VEGANO
  { id: 'photo-1568901346375-23c9450c58cd', tags: ['hamburguesa', 'burger', 'pan', 'fast food', 'patatas'] },
  { id: 'photo-1565557623262-b51c2513a641', tags: ['pizza', 'horno', 'masa', 'tomate', 'queso'] },
  { id: 'photo-1628840042765-356cda07504e', tags: ['pizza', 'porcion', 'casera', 'crujiente'] },

  // 🥑 TOSTADAS & DESAYUNOS
  { id: 'photo-1541519227354-08fa5d50c44d', tags: ['tostada', 'pan', 'aguacate', 'desayuno', 'brunch', 'tomate'] },
  { id: 'photo-1484723091739-30a097e8f929', tags: ['desayuno', 'avena', 'porridge', 'frutas', 'bol', 'cereales'] },
  
  // 🌮 TACOS & MEXICANO
  { id: 'photo-1565299585323-38d6b0865b47', tags: ['tacos', 'fajitas', 'mexicano', 'tortillas', 'picante', 'guacamole'] }
];

export function getBestImageForRecipe(title: string, ingredientsRaw: string): string {
  const normalizedTitle = title.toLowerCase();
  const normalizedIngredients = ingredientsRaw.toLowerCase();
  const combinedText = `${normalizedTitle} ${normalizedIngredients}`;

  let bestMatchId = 'photo-1512621776951-a57141f2eefd'; // Ensalada default si no hay match
  let maxScore = 0;

  for (const img of IMAGE_REPOSITORY) {
    let score = 0;
    
    for (const tag of img.tags) {
      // Puntos dobles si el tag está en el título
      if (normalizedTitle.includes(tag)) {
        score += 3;
      }
      // Puntos simples si el tag está en los ingredientes
      else if (combinedText.includes(tag)) {
        score += 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatchId = img.id;
    }
  }

  // Si hay empate o puntuación muy baja, elegimos aleatoriamente entre los mejores para dar variedad
  if (maxScore > 0) {
    const topMatches = IMAGE_REPOSITORY.filter(img => {
       let score = 0;
       for(const tag of img.tags) {
         if (normalizedTitle.includes(tag)) score += 3;
         else if (combinedText.includes(tag)) score += 1;
       }
       return score === maxScore;
    });
    
    if (topMatches.length > 0) {
      bestMatchId = topMatches[Math.floor(Math.random() * topMatches.length)].id;
    }
  } else {
      // Total random fallback si no hay coincidencias de nada
      bestMatchId = IMAGE_REPOSITORY[Math.floor(Math.random() * IMAGE_REPOSITORY.length)].id;
  }

  return `https://images.unsplash.com/${bestMatchId}?q=80&w=2000&auto=format&fit=crop&sig=${Math.floor(Math.random() * 9999)}`;
}
