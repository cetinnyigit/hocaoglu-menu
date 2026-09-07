# Esnaf Menü

NFC kartla açılan dijital esnaf menüleri. Next.js 14 (App Router) + TypeScript + Tailwind.

Canlı sayfa: `/menu/hocaoglu`

## Geliştirme

```bash
npm run dev     # http://localhost:3000
npm run build   # production build + statik sayfa üretimi
npm run start   # build'i lokalde çalıştır
```

## Yapı

```
app/menu/[slug]/page.tsx   Dinamik menü route'u (build'de statik üretilir)
lib/menu-data/             Menü verisi — tek doğruluk kaynağı
  types.ts                 Ortak veri modeli
  hocaoglu.ts              Hocaoğlu Börek & Cafe menüsü
  index.ts                 Esnaf kaydı
components/menu/           Sunum bileşenleri
public/menu/<slug>/        Esnafa ait fotoğraflar
```

Menü içeriği server'da render edilir. Sayfadaki tek client bileşeni
`CategoryNav` (kategori scroll-spy'ı).

## Fiyat girme

`lib/menu-data/hocaoglu.ts` içinde her ürünün `price` alanı boş. Tırnakların
arasına yaz:

```ts
{ name: 'Künefe', price: '₺180' },
```

Fiyat girilen üründe fiyat, boş bırakılanda orijinal tasarımdaki renkli çubuk
placeholder'ı gösterilir. İkisi karışık olabilir.

## Yeni esnaf ekleme

1. Fotoğrafları `public/menu/<slug>/` altına koy.
2. `lib/menu-data/<slug>.ts` oluştur, `hocaoglu.ts`'i şablon al.
3. `lib/menu-data/index.ts` içindeki `restaurants` dizisine ekle.

Route otomatik gelir: `/menu/<slug>`. `generateStaticParams` her esnaf için
build sırasında statik HTML üretir; listede olmayan slug'lar 404 döner.

## Bölüm bloklarına dair

Her bölümün içeriği sıralı `blocks` dizisidir — `note`, `cards`, `photo`,
`group`. Sıra neyse sayfada o sırayla render edilir, böylece fotoğraf ve liste
düzeni esnaftan esnafa değişebilir.

## Bilinen sınırlamalar

- **Yellowtail fontu Türkçe'yi tam kapsamıyor.** Fontun yalnızca `latin` alt
  kümesi var; `ş`, `ğ`, `İ` glifleri yok ve tarayıcı bu harflerde cursive
  fallback'e düşer. Orijinal HTML'de de durum böyleydi. Etkilenen tek başlık:
  "Şeker Tadında". Tam Türkçe destekli bir script font (Pacifico, Dancing
  Script, Great Vibes) ile değiştirilebilir.
- **Kaynak fotoğraflar düşük çözünürlüklü** (578–900 px). Orijinal HTML'e
  gömülü hâlleriyle çıkarıldı; yüksek DPI telefonlarda hafif yumuşak
  görünebilir. Daha büyük orijinaller varsa `public/menu/hocaoglu/` altındaki
  dosyaları değiştirmek ve `lib/menu-data/hocaoglu.ts` içindeki
  `width`/`height` değerlerini güncellemek yeterli.
