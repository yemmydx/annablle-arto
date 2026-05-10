// Список коллекций по разделам — используется и в админке, и на сайте.
// Источник: menuData.ts (mega-menu)

export const COLLECTIONS_BY_SECTION: Record<string, string[]> = {
  lingerie: [
    'Cotton', 'Obrana lingerie', 'Freedom', 'Idol', 'Noemi', 'Anabelle',
    'Dea', 'Aida', 'Per Amore', 'Lure', 'Rosalia', 'Sorpresa', 'FATALE',
    'Lily', 'Lovely', 'Intrigo', 'Énigme', 'Peony', 'Charm', 'Instinct',
    'Velour (Lux)', 'Zefira', 'Diana', 'Silk', 'Strong&Tender', 'Nika',
  ],
  swim: [
    'Costa Brava', 'Sunny Kiss', 'Afina', 'Perla', 'Laguna', 'Malibu',
    'Sport Glam', 'Basic Line Anabel Arto', 'Bora-Bora', 'Siren',
    'Monte-Carlo', 'Zagrava', 'Mandry', 'Slavna', 'Mantra', 'Bella',
    'Barvy', 'Synevyr', 'Dolce Vita', 'Marrakesh', 'Sahara', 'Cruise',
    'Monaco', 'Wild&Free', 'Dopamine Splash', 'Diva', 'Flora Noir',
    'Tropicana', 'Playa', 'Basic Line Obrana', 'Tesoro', 'Copacabana',
    'Wild&Gentle', 'Liana',
  ],
  clothes: [
    'Velour (Lux)', 'Obrana lingerie', 'Cotton', 'Lure', 'Peony', 'Dea',
    'Lily', 'Lovely', 'Amuleto', 'Idol', 'Énigme', 'MAVKA', 'Noemi',
    'Savana', 'FATALE', 'Silk', 'Erato (Lux)', 'Nika', 'Instinct',
    'Miracle', 'Aurora', 'Aida', 'Violett',
  ],
  tights: [
    'Classic', 'Day & Night', 'Winter Soft', 'Shape', 'Lace',
  ],
  men: [
    'Basic', 'Sport', 'Comfort', 'Premium',
  ],
  kids: [
    'Cotton Kids', 'Sport Junior', 'Sweet Dreams',
  ],
}

// Все коллекции в одном массиве (для общего списка)
export const ALL_COLLECTIONS = Array.from(
  new Set(Object.values(COLLECTIONS_BY_SECTION).flat())
).sort()
