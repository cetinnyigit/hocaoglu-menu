/**
 * Esnaf menüleri için ortak veri modeli.
 * Yeni bir esnaf eklemek için: lib/menu-data/<slug>.ts oluştur, index.ts'e kaydet.
 */

/** Bölüm renk temaları — globals.css'teki .theme-* sınıflarına karşılık gelir. */
export type MenuTheme =
  | 'red'
  | 'tan'
  | 'olive'
  | 'brown'
  | 'green'
  | 'navy'
  | 'gold'

/**
 * Esnafın genel renk kimliği — globals.css'teki .brand-* sınıfına karşılık
 * gelir ve zemin/kağıt/metin değişkenlerini ezer. Belirtilmezse sitenin
 * varsayılan krem paleti kullanılır.
 */
export type MenuPalette = 'ay'

export type MenuImage = {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * Ürünün detay kartında gösterilen ek bilgiler. Hepsi isteğe bağlı — biri
 * bile doluysa satır tıklanabilir olur ve büyük görselli kart açılır.
 *
 * Kalori bilgisi bilerek ayrı ve isteğe bağlı: esnaf ölçümleri yaptıkça
 * ürün ürün eklenebilir, eksik olanlarda kart kalori satırını gizler.
 */
export type MenuItemDetail = {
  /** Detay kartında büyük, satırda küçük kare olarak gösterilir. */
  image?: MenuImage
  /** İçindekiler / hazırlanış. Kartın gövde metni. */
  desc?: string
  /**
   * Porsiyon bilgisi. Ürün adında gramaj yazan dönerlerde boş bırakılır;
   * içecek gibi adında ölçü olmayan ürünlerde kullanılır ("330 ml").
   *
   * DİKKAT: ölçüyü ürün adına yazmak yerine bu alan var, çünkü ad panelde
   * kaydedilen fiyatın anahtarını üretiyor (lib/menu-key.ts) — adı
   * değiştirmek o ürünün kayıtlı fiyatını düşürür.
   */
  size?: string
  /** kcal. Porsiyon başına; 0 ile boş ayırt edilebilsin diye number. */
  calories?: number
}

export type MenuItem = MenuItemDetail & {
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
 * Menünün en altındaki iletişim bloğu. Tamamı isteğe bağlı; yalnızca dolu
 * alanlar gösterilir, hiçbiri yoksa blok hiç basılmaz.
 */
export type MenuContact = {
  address?: string
  /** Tıklanınca arama başlatılır; yazıldığı gibi gösterilir. Birden çok olabilir. */
  phones?: string[]
  /** Başındaki @ olmadan kullanıcı adı, ör. 'aydonerkofte'. */
  instagram?: string
  /** Çalışma saatleri, tek satır: "Her gün 10:00 - 23:00". */
  hours?: string
  /** Adresin tıklanabilir olması için harita bağlantısı. */
  mapsUrl?: string
}

/**
 * Bölüm içeriği sıralı bloklar hâlinde tutulur; böylece fotoğraf/liste/not
 * sırası her esnaf için serbestçe değiştirilebilir.
 */
export type MenuBlock =
  | {
      kind: 'note'
      title: string
      body: string
      price?: string
      soldOut?: boolean
    }
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
  established?: string
  tagline: string
  /** Varsayılan krem palet yerine esnafa özel renk kimliği. */
  palette?: MenuPalette
  hero: MenuImage
  sections: MenuSection[]
  /** Menünün en altında gösterilir; tanımsızsa blok basılmaz. */
  contact?: MenuContact
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
  /** Panelden yazılan içerik metni; koddaki desc'i ezer. */
  desc?: string
  calories?: number
  /**
   * Panelden yüklenen ürün görseli. alt metni ürün adından türetildiği için
   * burada tutulmuyor — ad değişirse alt da kendiliğinden doğru kalsın.
   */
  image?: {
    src: string
    width: number
    height: number
  }
}

export type MenuOverrides = {
  version: 1
  updatedAt: string
  /** Anahtar: lib/menu-key.ts içindeki itemKey/cardKey üretimi. */
  items: Record<string, ItemOverride>
}
