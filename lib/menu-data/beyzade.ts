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
