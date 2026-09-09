import type { Restaurant } from './types'

/**
 * Ay Döner ve Köfte menüsü. Fiyatlar 24.06.2026 tarihli menü panosundan.
 *
 * GRAMAJ: aynı ürün birden çok gramajda satıldığı için gramaj ürün adının
 * içinde tutuluyor ("Dürüm Et (80gr)"). Ad, panelde kaydedilen fiyatın
 * anahtarını da ürettiği için (lib/menu-key.ts) gramajsız yazılırsa üç ayrı
 * dürümün fiyatı birbirine karışır.
 */
export const ay: Restaurant = {
  slug: 'ay',
  name: 'Ay Döner & Köfte',
  tagline: 'Döner · Köfte · Izgara',
  palette: 'ay',
  hero: {
    src: '/menu/ay/hero.jpg',
    alt: 'Ay Döner ve Köfte',
    width: 596,
    height: 335,
  },
  seo: {
    title: 'Ay Döner ve Köfte - Menü',
    description:
      'Ay Döner ve Köfte menüsü: et ve tavuk dönerler, köfte, ızgara, çorba, ara sıcaklar, tatlılar ve içecekler.',
  },
  footer: {
    text: 'Ay Döner & Köfte · Tüm yemek kartları geçerlidir',
    vatNote: 'Fiyatlarımıza KDV ve tüm vergiler dahildir',
  },
  sections: [
    {
      id: 'et-doner',
      navLabel: 'Et Dönerler',
      theme: 'navy',
      heading: 'Et Dönerler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Beyti Et (120gr)', price: '600' },
            { name: 'İskender Et (120gr)', price: '550' },
            { name: 'İskender Et (180gr)', price: '750' },
            { name: 'Pilav Üstü Et (100gr)', price: '500' },
            { name: 'Pilav Üstü Et (150gr)', price: '700' },
            { name: 'Porsiyon Et (100gr)', price: '450' },
            { name: 'Porsiyon Et (150gr)', price: '650' },
            { name: 'Dürüm Et (80gr)', price: '360' },
            { name: 'Dürüm Et (100gr)', price: '450' },
            { name: 'Dürüm Et (120gr)', price: '540' },
            { name: 'Tam Ekmek Et (100gr)', price: '400' },
            { name: 'Tam Ekmek Et (120gr)', price: '540' },
            { name: 'Tam Ekmek Et (150gr)', price: '650' },
            { name: '3 Çeyrek Et (80gr)', price: '360' },
            { name: '3 Çeyrek Et (100gr)', price: '450' },
            { name: '3 Çeyrek Et (150gr)', price: '650' },
            { name: 'Yarım Ekmek Et (50gr)', price: '230' },
            { name: 'Yarım Ekmek Et (80gr)', price: '360' },
            { name: 'Yarım Ekmek Et (100gr)', price: '450' },
            { name: 'Tombik Ekmek Et (50gr)', price: '230' },
            { name: 'Tombik Ekmek Et (80gr)', price: '360' },
            { name: 'Tombik Ekmek Et (100gr)', price: '450' },
          ],
        },
      ],
    },
    {
      id: 'tavuk-doner',
      navLabel: 'Tavuk Dönerler',
      theme: 'gold',
      heading: 'Tavuk Dönerler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'İskender Tavuk (120gr)', price: '400' },
            { name: 'Pilav Üstü Tavuk (120gr)', price: '300' },
            { name: 'Pilav Üstü Tavuk (180gr)', price: '400' },
            { name: 'Porsiyon Tavuk (120gr)', price: '250' },
            { name: 'Porsiyon Tavuk (180gr)', price: '350' },
            { name: 'Dürüm Tavuk (100gr)', price: '200' },
            { name: 'Dürüm Tavuk (120gr)', price: '240' },
            { name: 'Dürüm Tavuk (150gr)', price: '300' },
            { name: 'Tam Ekmek Tavuk (120gr)', price: '240' },
            { name: 'Tam Ekmek Tavuk (150gr)', price: '300' },
            { name: 'Tam Ekmek Tavuk (200gr)', price: '350' },
            { name: '3 Çeyrek Tavuk (120gr)', price: '240' },
            { name: '3 Çeyrek Tavuk (150gr)', price: '300' },
            { name: '3 Çeyrek Tavuk (200gr)', price: '350' },
            { name: 'Yarım Ekmek Tavuk (60gr)', price: '120' },
            { name: 'Yarım Ekmek Tavuk (100gr)', price: '200' },
            { name: 'Yarım Ekmek Tavuk (120gr)', price: '240' },
            { name: 'Tombik Ekmek Tavuk (60gr)', price: '120' },
            { name: 'Tombik Ekmek Tavuk (100gr)', price: '200' },
            { name: 'Tombik Ekmek Tavuk (120gr)', price: '240' },
          ],
        },
      ],
    },
    {
      id: 'izgara',
      navLabel: 'Izgaralar',
      theme: 'navy',
      heading: 'Izgaralar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Porsiyon Köfte (150gr)', price: '400' },
            { name: 'Tam Ekmek Köfte (150gr)', price: '400' },
            { name: '3 Çeyrek Köfte (150gr)', price: '400' },
            { name: 'Yarım Ekmek Köfte (90gr)', price: '270' },
            { name: 'Dürüm Köfte (150gr)', price: '400' },
            { name: 'Tavuk Şiş (220-250gr)', price: '400' },
            { name: 'Tavuk Çöp Şiş (220-250gr)', price: '450' },
            { name: 'Tavuk Kanat (220-250gr)', price: '500' },
            { name: 'Tavuk Pirzola (400-450gr)', price: '600' },
            { name: 'Karışık Tavuk (450-500gr)', price: '600' },
          ],
        },
      ],
    },
    {
      id: 'corba',
      navLabel: 'Çorba',
      theme: 'gold',
      heading: 'Çorba',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [{ name: 'Çorba', price: '100' }],
        },
      ],
    },
    {
      id: 'ara-sicak',
      navLabel: 'Ara Sıcaklar',
      theme: 'navy',
      heading: 'Ara Sıcaklar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'İçli Köfte (adet)', price: '100' },
            { name: 'Lavaş', price: '25' },
            { name: 'Patates Kızartması (200gr)', price: '150' },
            { name: 'Patso (200gr)', price: '150' },
            // Panoda fiyatı boş bırakılmış ürünler; panelden doldurulabilir.
            { name: 'Acı Ezme (200gr)', price: '' },
            { name: 'Karışık Turşu (200gr)', price: '' },
            { name: 'Acı Biber Turşusu (100gr)', price: '' },
            { name: 'Yoğurt (150gr)', price: '100' },
            { name: 'Yoğurtlu Ezme (200gr)', price: '' },
            { name: 'Pilav (200gr)', price: '100' },
          ],
        },
      ],
    },
    {
      id: 'tatli',
      navLabel: 'Tatlılar',
      theme: 'gold',
      heading: 'Tatlılar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Fındıklı Fırın Sütlaç', price: '130' },
            { name: 'Fırın Sütlaç', price: '110' },
            { name: 'Künefe', price: '150' },
            { name: 'Katmer', price: '150' },
            { name: 'Kadayıf', price: '150' },
          ],
        },
      ],
    },
    {
      id: 'icecek',
      navLabel: 'İçecekler',
      theme: 'navy',
      heading: 'İçecekler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Pepsi - Yedigün', price: '70' },
            { name: 'Ayran', price: '50' },
            { name: 'Açık Ayran', price: '80' },
            { name: 'Cappy', price: '70' },
            { name: 'Ice Tea', price: '70' },
            { name: 'Şalgam', price: '50' },
            { name: 'Meyveli Soda', price: '35' },
            { name: 'Sade Soda', price: '30' },
            { name: 'Çay', price: '20' },
            { name: 'Nescafe', price: '75' },
            { name: 'Türk Kahvesi', price: '75' },
          ],
        },
      ],
    },
  ],
}
