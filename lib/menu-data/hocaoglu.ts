import type { Restaurant } from './types'

/**
 * Hocaoğlu Börek & Cafe menüsü.
 *
 * FİYAT EKLEME: her ürünün price alanı şu an boş. Tırnakların arasına yaz
 * (ör. price: '₺120'). Boş bırakılan ürünlerde fiyat yerine mevcut renkli
 * çubuk placeholder'ı gösterilmeye devam eder.
 */
export const hocaoglu: Restaurant = {
  slug: 'hocaoglu',
  name: 'Hocaoğlu',
  established: "1962'DEN BERİ",
  tagline: 'Börek & Cafe',
  hero: {
    src: '/menu/hocaoglu/hero.jpg',
    alt: 'Hocaoğlu Kahvaltı',
    width: 900,
    height: 591,
  },
  seo: {
    title: 'Hocaoğlu Börek Cafe - Menü',
    description:
      "1962'den beri Hocaoğlu Börek & Cafe. Kahvaltı, börek, pide, tost, makarna, tatlı ve içecek menüsü.",
  },
  footer: {
    text: "Hocaoğlu Börek & Cafe · 1962'den beri",
    vatNote: 'Fiyatlarımıza KDV dahildir',
  },
  sections: [
    {
      id: 'kahvalti',
      navLabel: 'Kahvaltı',
      theme: 'brown',
      heading: 'güzel bir güne günaydın',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'note',
          title: 'Premium Kahvaltı',
          body: 'Domates, salatalık, maydanoz, sigara böreği, patates kızartması, çeçil peyniri, kaşar peyniri, klasik peynir, salam, bal, reçel, yeşil zeytin, siyah zeytin, kaymak, tahin, pekmez, tulum peyniri — isteğe göre Menemen veya sucuklu sahanda yumurta',
        },
        {
          kind: 'cards',
          cards: [
            {
              name: 'Gold Kahvaltı',
              desc: 'Yeşil zeytin, siyah zeytin, sigara böreği, beyaz peynir, kaşar peyniri, salatalık, domates, haşlanmış yumurta, tereyağı, bal, kaymak, salam',
              price: '',
            },
            {
              name: 'Klasik Kahvaltı',
              desc: 'Yeşil zeytin, siyah zeytin, sigara böreği, beyaz peynir, kaşar peyniri, salatalık, domates, haşlanmış yumurta, tereyağı, bal, kaymak, salam',
              price: '',
            },
            {
              name: 'Mini Kahvaltı',
              desc: 'Yeşil zeytin, siyah zeytin, sigara böreği, beyaz peynir, kaşar peyniri, salatalık, domates, haşlanmış yumurta, tereyağı, bal, kaymak, salam',
              price: '',
            },
          ],
        },
        {
          kind: 'photo',
          spaced: true,
          image: {
            src: '/menu/hocaoglu/gold-kahvalti.jpg',
            alt: 'Gold Kahvaltı',
            width: 900,
            height: 578,
          },
        },
      ],
    },
    {
      id: 'ekstra',
      navLabel: 'Ekstralar',
      theme: 'tan',
      heading: 'Extra Lezzetler',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Söğüş Tabağı', price: '' },
            { name: 'Peynir Tabağı', price: '' },
            { name: 'Zeytin', price: '' },
            { name: 'Bal & Tereyağ', price: '' },
            { name: 'Reçel', price: '' },
            { name: 'Haşlanmış Yumurta', price: '' },
            { name: 'Yumurta Tabağı', price: '' },
            { name: 'Patates Kızartması', price: '' },
            { name: 'Salam & Sosis Tabağı', price: '' },
            { name: 'Hellim Izgara', price: '' },
            { name: 'Tahin & Pekmez', price: '' },
            { name: 'Pişi Tabağı', price: '' },
            { name: 'Muz & Bal & Ceviz', price: '' },
            { name: 'Çikolatalı Krep', price: '' },
            { name: 'Çiğ Börek', price: '' },
            { name: 'Simit Tabağı', price: '' },
            { name: 'Yumurtalı Ekmek', price: '' },
          ],
        },
      ],
    },
    {
      id: 'omlet',
      navLabel: 'Omlet & Sahan',
      theme: 'red',
      heading: 'Dumanı üstünde',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'group',
          title: 'Omlet',
          items: [
            { name: 'Sade Omlet', price: '' },
            { name: 'Kaşarlı Omlet', price: '' },
            { name: 'Karışık Omlet', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Sahanlar',
          items: [
            { name: 'Sade Yumurta', price: '' },
            { name: 'Sucuklu Yumurta', price: '' },
            { name: 'Kaşarlı Yumurta', price: '' },
            { name: 'Beyaz Peynirli', price: '' },
            { name: 'Sade Sucuk', price: '' },
            { name: 'Kavurmalı', price: '' },
          ],
        },
      ],
    },
    {
      id: 'gozleme',
      navLabel: 'Gözleme & Mantı',
      theme: 'tan',
      heading: 'Gözlemeler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Patatesli', price: '' },
            { name: 'Ispanaklı', price: '' },
            { name: 'Peynirli', price: '' },
            { name: 'Kaşarlı', price: '' },
            { name: 'Kaşarlı Sucuklu', price: '' },
            { name: 'Ekstra Garnitür', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Mantı',
          items: [
            { name: 'Kuru Mantı', price: '' },
            { name: 'Kayseri Mantısı', price: '' },
            { name: 'İçli Köfte', price: '' },
          ],
        },
      ],
    },
    {
      id: 'sandvic',
      navLabel: 'Sandviç',
      theme: 'tan',
      heading: 'Sandviçler',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          title: 'Soğuk Sandviçler',
          items: [
            { name: 'Beyaz Peynirli', price: '' },
            { name: 'Kaşar-Salamlı', price: '' },
            { name: 'Kepekli Sandviç', price: '' },
            { name: 'Çavdarlı Sandviç', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Sıcak Sandviçler',
          items: [
            { name: 'Patso', price: '' },
            { name: 'Sosisli', price: '' },
          ],
        },
      ],
    },
    {
      id: 'makarna',
      navLabel: 'Makarna',
      theme: 'olive',
      heading: 'Makarnalar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Noodle Sebzeli', price: '' },
            { name: 'Noodle Tavuklu', price: '' },
            { name: 'Penne Arrabiata', price: '' },
            { name: 'Fettucini Alfredo', price: '' },
            { name: 'Domates Soslu', price: '' },
            { name: 'Köri Soslu', price: '' },
            { name: 'Pesto Soslu', price: '' },
          ],
        },
      ],
    },
    {
      id: 'borek',
      navLabel: 'Sigara Böreği',
      theme: 'olive',
      heading: 'Sigara Böreği',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Peynirli', price: '' },
            { name: 'Patatesli', price: '' },
            { name: 'Kaşarlı', price: '' },
            { name: 'Ispanaklı', price: '' },
          ],
        },
      ],
    },
    {
      id: 'tost',
      navLabel: 'Tost',
      theme: 'olive',
      heading: 'Tostlar',
      headingStyle: 'plain',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Beyaz Peynirli', price: '' },
            { name: 'Kaşarlı', price: '' },
            { name: 'Kaşar Sucuklu', price: '' },
            { name: 'Sucuklu', price: '' },
            { name: 'Kavurmalı', price: '' },
            { name: 'Ayvalık Tostu', price: '' },
            { name: 'Ekstra Domates', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Bazlama Tost',
          items: [
            { name: 'Kaşarlı', price: '' },
            { name: 'Kaşarlı Sucuklu', price: '' },
            { name: 'Kavurmalı Kaşarlı', price: '' },
          ],
        },
      ],
    },
    {
      id: 'pide',
      navLabel: 'Pide & Börek',
      theme: 'brown',
      heading: 'Hamurdan Lezzetler',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'group',
          title: 'Kastamonu Kır Pidesi',
          items: [
            { name: 'Kıymalı Pide', price: '' },
            { name: 'Peynirli Pide', price: '' },
            { name: 'Patatesli Pide', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Açık Pideler',
          items: [
            { name: 'Kıymalı Pide', price: '' },
            { name: 'Kıymalı-Yumurtalı', price: '' },
            { name: 'Kuşbaşılı', price: '' },
            { name: 'Kuşbaşılı-Kavurmalı', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Börekler',
          items: [
            { name: 'Sade Börek', price: '' },
            { name: 'Kıymalı Börek', price: '' },
            { name: 'Peynirli Börek', price: '' },
            { name: 'Patatesli Börek', price: '' },
            { name: 'Su Böreği', price: '' },
          ],
        },
      ],
    },
    {
      id: 'burger',
      navLabel: 'Burger & Dürüm',
      theme: 'red',
      heading: 'Nefis Burgerler',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'group',
          title: 'Burgerler',
          items: [
            { name: 'Burger 80 gr', price: '' },
            { name: 'Cheese Burger 80 gr', price: '' },
            { name: 'Double Burger 160 gr', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Ana Yemekler',
          items: [
            { name: 'Izgara Köfte', price: '' },
            { name: 'Yarım Ekmek Köfte', price: '' },
          ],
        },
        {
          kind: 'group',
          title: 'Dürümler',
          items: [
            { name: 'Tavuk Dürüm', price: '' },
            { name: 'Kaşarlı Tavuk Dürüm', price: '' },
            { name: 'Köfte Dürüm', price: '' },
            { name: 'Kaşarlı Köfte Dürüm', price: '' },
          ],
        },
      ],
    },
    {
      id: 'tavuk',
      navLabel: 'Tavuk',
      theme: 'tan',
      heading: 'Tavuk Yemekleri',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Izgara Tavuk', price: '' },
            { name: 'Country Chicken', price: '' },
            { name: 'Köri Soslu Tavuk', price: '' },
            { name: 'Kekikli Piliç', price: '' },
            { name: 'Meksika Soslu Tavuk', price: '' },
            { name: 'Chicken Mushroom', price: '' },
            { name: 'Tavuk Şinitzel', price: '' },
            { name: 'Barbekü Soslu Tavuk', price: '' },
            { name: 'Cheddar Soslu Tavuk', price: '' },
            { name: 'Beğendi Soslu Tavuk', price: '' },
          ],
        },
      ],
    },
    {
      id: 'tatli',
      navLabel: 'Tatlı',
      theme: 'green',
      heading: 'Şeker Tadında',
      headingStyle: 'script',
      blocks: [
        {
          kind: 'photo',
          image: {
            src: '/menu/hocaoglu/tatli.jpg',
            alt: 'Tatlı',
            width: 578,
            height: 354,
          },
        },
        {
          kind: 'group',
          title: 'Tatlılar',
          items: [
            { name: 'Künefe', price: '' },
            { name: 'Sütlaç', price: '' },
            { name: 'Profiterol', price: '' },
            { name: 'Trileçe', price: '' },
            { name: 'Ekler Porsiyon', price: '' },
            { name: 'Magnolya', price: '' },
            { name: 'Cheesecake', price: '' },
          ],
        },
        {
          kind: 'photo',
          spaced: true,
          image: {
            src: '/menu/hocaoglu/pasta-1.jpg',
            alt: 'Pasta',
            width: 578,
            height: 354,
          },
        },
        {
          kind: 'group',
          title: 'Pastalar',
          items: [
            { name: 'Meyveli Pasta', price: '' },
            { name: 'Çilekli Pasta', price: '' },
            { name: 'Çikolatalı Pasta', price: '' },
            { name: 'Şeker Hamurlu Pasta', price: '' },
          ],
        },
        {
          kind: 'photo',
          spaced: true,
          image: {
            src: '/menu/hocaoglu/pasta-2.jpg',
            alt: 'Pasta',
            width: 578,
            height: 355,
          },
        },
      ],
    },
    {
      id: 'icecek',
      navLabel: 'İçecek',
      theme: 'tan',
      heading: 'İçecekler',
      headingStyle: 'plain',
      headingInk: true,
      blocks: [
        {
          kind: 'group',
          items: [
            { name: 'Çay', price: '' },
            { name: 'Servissiz Çay', price: '' },
            { name: 'Fincan Çay', price: '' },
            { name: 'Sıcak Süt', price: '' },
            { name: 'Nescafe', price: '' },
            { name: 'Açık Ayran', price: '' },
            { name: 'Küçük Ayran', price: '' },
            { name: 'Büyük Ayran', price: '' },
            { name: 'Limonata', price: '' },
            { name: 'Soğuk Çay', price: '' },
            { name: 'Su', price: '' },
            { name: 'Sıkma Portakal', price: '' },
            { name: 'Kola-Fanta', price: '' },
            { name: 'Meyve Suyu', price: '' },
            { name: 'Soda', price: '' },
            { name: 'Meyveli Soda', price: '' },
            { name: 'Filtre Kahve', price: '' },
            { name: 'Latte', price: '' },
            { name: 'Cappuccino', price: '' },
            { name: 'Mocha', price: '' },
            { name: 'Espresso', price: '' },
            { name: 'Sahlep', price: '' },
            { name: 'Sıcak Çikolata', price: '' },
            { name: 'Türk Kahvesi', price: '' },
          ],
        },
      ],
    },
  ],
}
