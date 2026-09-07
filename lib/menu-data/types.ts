/**
 * Esnaf menüleri için ortak veri modeli.
 * Yeni bir esnaf eklemek için: lib/menu-data/<slug>.ts oluştur, index.ts'e kaydet.
 */

/** Bölüm renk temaları — globals.css'teki .theme-* sınıflarına karşılık gelir. */
export type MenuTheme = 'red' | 'tan' | 'olive' | 'brown' | 'green'

export type MenuImage = {
  src: string
  alt: string
  width: number
  height: number
}

export type MenuItem = {
  name: string
  /** Boş bırakılırsa fiyat yerine renkli çubuk placeholder gösterilir. */
  price?: string
  /** Panelden işaretlenir; menüde soluk gösterilir. */
  soldOut?: boolean
}

export type MenuCard = {
  name: string
  desc: string
  price?: string
  soldOut?: boolean
}

/**
 * Bölüm içeriği sıralı bloklar hâlinde tutulur; böylece fotoğraf/liste/not
 * sırası her esnaf için serbestçe değiştirilebilir.
 */
export type MenuBlock =
  | { kind: 'note'; title: string; body: string }
  | { kind: 'cards'; cards: MenuCard[] }
  | { kind: 'photo'; image: MenuImage; spaced?: boolean }
  | { kind: 'group'; title?: string; items: MenuItem[] }

export type MenuSection = {
  /** Hem DOM id'si hem de kategori nav'ındaki anchor hedefi. */
  id: string
  navLabel: string
  theme: MenuTheme
  heading: string
  /** 'script' = Yellowtail el yazısı, 'plain' = kalın Poppins. */
  headingStyle: 'script' | 'plain'
  /** true ise başlık tema rengi yerine ana metin rengini kullanır. */
  headingInk?: boolean
  blocks: MenuBlock[]
}

export type Restaurant = {
  slug: string
  name: string
  /** Hero üstündeki küçük büyük harfli satır, ör. "1962'DEN BERİ". */
  established: string
  tagline: string
  hero: MenuImage
  sections: MenuSection[]
  footer: {
    text: string
    vatNote: string
  }
  seo: {
    title: string
    description: string
  }
}

/**
 * Panelden kaydedilen değişiklikler. Menünün kendisi kodda sabit kalır;
 * burada yalnızca esnafın düzenleyebildiği alanlar tutulur ve render
 * sırasında menünün üzerine bindirilir.
 */
export type ItemOverride = {
  price?: string
  soldOut?: boolean
}

export type MenuOverrides = {
  version: 1
  updatedAt: string
  /** Anahtar: lib/menu-key.ts içindeki itemKey/cardKey üretimi. */
  items: Record<string, ItemOverride>
}
