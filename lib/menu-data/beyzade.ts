import type { Restaurant } from './types'

/**
 * Beyzade Pide & Kebap & Lahmacun menüsü. Ürünler ve fiyatlar masadaki
 * basılı menü kartından alındı (fotoğraf: 17.09.2026); fiyatlar kartın
 * üzerine bantla yapıştırılmış el yazısı listeden okundu.
 *
 * LAHMACUNLAR VE TATLILAR: kartta bu iki bölümün rakamları bandın altında
 * kalmış / okunamayacak kadar bozuktu, fiyatlar esnaftan ayrıca alındı.
 *
 * GÖRSELLER: bölümlerde bilerek fotoğraf yok. Kartın kendi fotoğrafları
 * kırpılıp denendi ama kaynak ~450-500 px olduğu için pütürlü duruyordu,
 * kaldırıldı. Esnaftan düzgün fotoğraf gelirse bölümün blocks dizisine bir
 * { kind: 'photo', image: {...} } eklemek yeterli. Üstteki logo görseli
 * (hero) yerinde.
 *
 * ÜRÜN GÖRSELİ / İÇERİK / KALORİ: bir ürüne image, desc veya calories
 * eklenirse satır tıklanabilir olur ve detay kartı açılır; panelden de
 * eklenebilir.
 */
export const beyzade: Restaurant = {
  slug: 'beyzade',
  name: 'Beyzade',
  tagline: 'Pide · Kebap · Lahmacun',
  palette: 'beyzade',
  hero: {
    src: '/menu/beyzade/hero.jpg',
    alt: 'Beyzade Pide & Kebap & Lahmacun',
    width: 1424,
    height: 432,
  },
  seo: {
    title: 'Beyzade Pide & Kebap & Lahmacun - Menü',
    description:
      'Beyzade menüsü: taş fırın pideler, etli ekmek, Adana ve Urfa kebap, Konya tandır, lahmacun, çorbalar ve tatlılar.',
  },
  // İletişim bilgisi esnaftan gelmedi; address/phones/instagram/hours
  // doldurulunca menünün altındaki blok kendiliğinden görünür.
  //
  // DİL SEÇENEKLERİ (turist müşteriler için). Ürün anahtarları
  // lib/menu-key.ts'ten türüyor: "bolum-id:main:urun-adi". Türkçe ürün adını
  // değiştirirsen anahtar da değişir ve çeviri düşer — fiyatla aynı kural.
  // Yeni ürünü çevirmeden bırakabilirsin, o satır Türkçe adıyla görünür.
  translations: {
    en: {
      tagline: 'Pide · Kebab · Lahmacun',
      seo: {
        title: 'Beyzade Pide & Kebab & Lahmacun - Menu',
        description:
          'Beyzade menu: stone-oven pide, Adana and Urfa kebabs, Konya tandır, lahmacun, soups and desserts.',
      },
      footer: {
        text: 'Beyzade Pide & Kebab & Lahmacun',
        vatNote: 'All taxes are included in our prices',
      },
      sections: {
        corbalar: { heading: 'Soups', navLabel: 'Soups' },
        pideler: { heading: 'Pide', navLabel: 'Pide' },
        kebaplar: { heading: 'Kebabs', navLabel: 'Kebabs' },
        lahmacunlar: { heading: 'Lahmacun', navLabel: 'Lahmacun' },
        tatlilar: { heading: 'Desserts', navLabel: 'Desserts' },
      },
      items: {
        'corbalar:main:gunun-corbasi': { name: 'Soup of the Day' },
        'corbalar:main:bamya-corbasi': { name: 'Okra Soup' },
        'corbalar:main:tavuk-corbasi': { name: 'Chicken Soup' },

        'pideler:main:kiymali-pide': { name: 'Minced Meat Pide' },
        'pideler:main:kusbasli-pide': { name: 'Diced Beef Pide' },
        'pideler:main:kasarli-pide': { name: 'Cheese Pide' },
        'pideler:main:karisik-pide': { name: 'Mixed Pide (Meat & Cheese)' },
        'pideler:main:kavurmali-pide': { name: 'Braised Beef Pide' },
        'pideler:main:etli-ekmek': { name: 'Etli Ekmek — Thin Meat Flatbread' },
        'pideler:main:mevlana-pide': { name: 'Mevlana Pide — Layered Meat Pide' },
        'pideler:main:bicak-arasi-pide': {
          name: 'Bıçak Arası — Chopped Meat Pide',
        },
        'pideler:main:konya-borek': { name: 'Konya Börek — Meat Pastry' },

        'kebaplar:main:adana-kebap': { name: 'Adana Kebab (spicy)' },
        'kebaplar:main:urfa-kebap': { name: 'Urfa Kebab (mild)' },
        'kebaplar:main:patlican-kebabi': { name: 'Eggplant Kebab' },
        'kebaplar:main:karisik-kebap': { name: 'Mixed Kebab Platter' },
        'kebaplar:main:konya-tandir-kebabi': {
          name: 'Konya Tandır — Slow-Roasted Lamb',
        },
        'kebaplar:main:tavuk-sis': { name: 'Chicken Shish' },
        'kebaplar:main:kanat': { name: 'Grilled Chicken Wings' },
        'kebaplar:main:tavuk-durum': { name: 'Chicken Wrap' },
        'kebaplar:main:adana-durum': { name: 'Adana Kebab Wrap' },

        'lahmacunlar:main:lahmacun': {
          name: 'Lahmacun — Turkish Minced Meat Flatbread',
        },
        'lahmacunlar:main:kasarli-lahmacun': { name: 'Lahmacun with Cheese' },

        'tatlilar:main:firinda-sutlac': { name: 'Baked Rice Pudding' },
        'tatlilar:main:fistikli-baklava': { name: 'Pistachio Baklava' },
      },
    },
    ar: {
      tagline: 'بيدة · كباب · لحم بعجين',
      seo: {
        title: 'بيزاده — بيدة وكباب ولحم بعجين · قائمة الطعام',
        description:
          'قائمة مطعم بيزاده: بيدة من فرن الحجر، كباب أضنة وأورفة، تندير قونيا، لحم بعجين، شوربات وحلويات.',
      },
      footer: {
        text: 'بيزاده — بيدة وكباب ولحم بعجين',
        vatNote: 'جميع الضرائب مشمولة في أسعارنا',
      },
      sections: {
        corbalar: { heading: 'الشوربات', navLabel: 'الشوربات' },
        pideler: { heading: 'البيدة', navLabel: 'البيدة' },
        kebaplar: { heading: 'الكباب', navLabel: 'الكباب' },
        lahmacunlar: { heading: 'اللحم بعجين', navLabel: 'اللحم بعجين' },
        tatlilar: { heading: 'الحلويات', navLabel: 'الحلويات' },
      },
      items: {
        'corbalar:main:gunun-corbasi': { name: 'شوربة اليوم' },
        'corbalar:main:bamya-corbasi': { name: 'شوربة البامية' },
        'corbalar:main:tavuk-corbasi': { name: 'شوربة الدجاج' },

        'pideler:main:kiymali-pide': { name: 'بيدة باللحم المفروم' },
        'pideler:main:kusbasli-pide': { name: 'بيدة بقطع اللحم' },
        'pideler:main:kasarli-pide': { name: 'بيدة بالجبن' },
        'pideler:main:karisik-pide': { name: 'بيدة مشكّلة (لحم وجبن)' },
        'pideler:main:kavurmali-pide': { name: 'بيدة بالقاورمة' },
        'pideler:main:etli-ekmek': { name: 'إتلي إكمك — خبز رقيق باللحم' },
        'pideler:main:mevlana-pide': { name: 'بيدة مولانا — طبقات باللحم' },
        'pideler:main:bicak-arasi-pide': {
          name: 'بيتشاك أراسي — بيدة باللحم المقطّع',
        },
        'pideler:main:konya-borek': { name: 'بورك قونيا — معجنات باللحم' },

        'kebaplar:main:adana-kebap': { name: 'كباب أضنة (حار)' },
        'kebaplar:main:urfa-kebap': { name: 'كباب أورفة (غير حار)' },
        'kebaplar:main:patlican-kebabi': { name: 'كباب الباذنجان' },
        'kebaplar:main:karisik-kebap': { name: 'كباب مشكّل' },
        'kebaplar:main:konya-tandir-kebabi': {
          name: 'تندير قونيا — لحم ضأن مطهو ببطء',
        },
        'kebaplar:main:tavuk-sis': { name: 'شيش طاووق' },
        'kebaplar:main:kanat': { name: 'أجنحة دجاج مشوية' },
        'kebaplar:main:tavuk-durum': { name: 'لفائف الدجاج (دورم)' },
        'kebaplar:main:adana-durum': { name: 'لفائف كباب أضنة (دورم)' },

        'lahmacunlar:main:lahmacun': { name: 'لحم بعجين' },
        'lahmacunlar:main:kasarli-lahmacun': { name: 'لحم بعجين بالجبن' },

        'tatlilar:main:firinda-sutlac': { name: 'سُتلاتش — أرز بالحليب بالفرن' },
        'tatlilar:main:fistikli-baklava': { name: 'بقلاوة بالفستق' },
      },
    },
  },
  footer: {
    text: 'Beyzade Pide & Kebap & Lahmacun',
    vatNote: 'Fiyatlarımıza KDV ve tüm vergiler dahildir',
  },
  sections: [
    {
      id: 'corbalar',
      navLabel: 'Çorbalar',
      theme: 'gold',
      heading: 'Çorbalar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Günün Çorbası', price: '150' },
            { name: 'Bamya Çorbası', price: '300' },
            { name: 'Tavuk Çorbası', price: '180' },
          ],
        },
      ],
    },
    {
      id: 'pideler',
      navLabel: 'Pideler',
      theme: 'navy',
      heading: 'Pideler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Kıymalı Pide', price: '450' },
            { name: 'Kuşbaşlı Pide', price: '500' },
            { name: 'Kaşarlı Pide', price: '480' },
            { name: 'Karışık Pide', price: '550' },
            { name: 'Kavurmalı Pide', price: '580' },
            { name: 'Etli Ekmek', price: '450' },
            { name: 'Mevlana Pide', price: '540' },
            { name: 'Bıçak Arası Pide', price: '580' },
            { name: 'Konya Börek', price: '480' },
          ],
        },
      ],
    },
    {
      id: 'kebaplar',
      navLabel: 'Kebaplar',
      theme: 'gold',
      heading: 'Kebaplar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Adana Kebap', price: '600' },
            { name: 'Urfa Kebap', price: '600' },
            { name: 'Patlıcan Kebabı', price: '740' },
            { name: 'Karışık Kebap', price: '1100' },
            { name: 'Konya Tandır Kebabı', price: '880' },
            { name: 'Tavuk Şiş', price: '400' },
            { name: 'Kanat', price: '450' },
            { name: 'Tavuk Dürüm', price: '300' },
            { name: 'Adana Dürüm', price: '350' },
          ],
        },
      ],
    },
    {
      id: 'lahmacunlar',
      navLabel: 'Lahmacunlar',
      theme: 'navy',
      heading: 'Lahmacunlar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            // Kartta fiyatlar bandın altında kaldı, esnaftan alındı.
            { name: 'Lahmacun', price: '150' },
            { name: 'Kaşarlı Lahmacun', price: '180' },
          ],
        },
      ],
    },
    {
      id: 'tatlilar',
      navLabel: 'Tatlılar',
      theme: 'gold',
      heading: 'Tatlılar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            // Kartta rakamlar okunamadı, esnaftan alındı.
            { name: 'Fırında Sütlaç', price: '100' },
            { name: 'Fıstıklı Baklava', price: '150' },
          ],
        },
      ],
    },
  ],
}
