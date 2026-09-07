# Esnaf Menü

NFC kartla açılan dijital esnaf menüleri. Next.js 14 (App Router) + TypeScript + Tailwind.

Canlı sayfa: `/menu/hocaoglu`

Menü sayfası: `/menu/hocaoglu` · Fiyat paneli: `/admin`

## Geliştirme

```bash
npm run dev         # http://localhost:3000
npm run build       # production build + statik sayfa üretimi
npm run start       # build'i lokalde çalıştır
npm run check:keys  # fiyat anahtarı çakışması var mı
```

`.env.example`'ı `.env.local` olarak kopyala ve doldur. `BLOB_READ_WRITE_TOKEN`
boş bırakılırsa panelden kaydedilenler `.data/` altındaki dosyaya yazılır,
yani panel token olmadan da lokalde denenebilir.

## Yapı

```
app/menu/[slug]/page.tsx   Dinamik menü route'u (build'de statik üretilir)
app/admin/                 Fiyat paneli (şifreli)
lib/menu-data/             Menü iskeleti — ürün adları, bölümler, temalar
  types.ts                 Ortak veri modeli
  hocaoglu.ts              Hocaoğlu Börek & Cafe menüsü
  index.ts                 Esnaf kaydı
lib/menu-store.ts          Fiyat/tükendi deposu (Vercel Blob)
lib/menu-merge.ts          Kayıtlı değerleri menünün üzerine bindirir
lib/menu-key.ts            Ürün ↔ kayıt eşleşmesi için kalıcı anahtar
components/menu/           Sunum bileşenleri
public/menu/<slug>/        Esnafa ait fotoğraflar
```

Menü içeriği server'da render edilir. Sayfadaki tek client bileşeni
`CategoryNav` (kategori scroll-spy'ı).

## Fiyatlar nasıl çalışıyor

Menünün iskeleti (ürün adları, bölümler, fotoğraflar) kodda sabit. Esnafın
değiştirebildiği iki alan — **fiyat** ve **tükendi** — Vercel Blob'da ayrı bir
JSON'da tutulur ve render sırasında menünün üzerine bindirilir.

Ziyaretçi tarafında performans kaybı yok: menü sayfası statik üretilmeye devam
eder ve CDN'den servis edilir. Panelden kaydedilince `revalidateTag` +
`revalidatePath` ile sayfa yeniden üretilir.

Fiyatı boş olan üründe orijinal tasarımdaki renkli çubuk placeholder'ı,
"tükendi" işaretlide soluk satır + rozet görünür.

Başlangıç fiyatlarını koda yazmak istersen `lib/menu-data/hocaoglu.ts`
içindeki `price` alanları hâlâ geçerli — panelden girilen değer onu ezer.

### Fiyat anahtarları

Kayıtlar ürünle `bölüm:grup:ürün-adı` biçiminde bir anahtarla eşleşir
(`lib/menu-key.ts`). Sadece ürün adı yeterli değil çünkü "Peynirli",
"Kaşarlı" gibi adlar birden fazla bölümde geçiyor.

**Bir ürünün adını değiştirirsen anahtarı da değişir ve o ürünün fiyatı
sıfırlanır.** Menü verisine dokunduktan sonra `npm run check:keys` çalıştır;
iki ürün aynı anahtarı üretiyorsa hata verir.

## Panel

`/admin` — tek ortak şifre ile giriş, 12 saatlik imzalı çerez oturumu.
Middleware `/admin` altındaki her şeyi korur, `robots.txt` dizine eklenmesini
engeller.

Gerekli ortam değişkenleri:

| Değişken | Ne işe yarar |
| --- | --- |
| `ADMIN_PASSWORD` | Müşteriye verilecek panel şifresi |
| `ADMIN_SESSION_SECRET` | Oturum çerezini imzalar, en az 16 karakter |
| `BLOB_READ_WRITE_TOKEN` | Vercel'de Blob store bağlanınca otomatik gelir |

Eksik değişken varsa `/admin/giris` 500 yerine hangi değişkenin eksik
olduğunu söyleyen bir sayfa gösterir.

## Yeni esnaf ekleme

1. Fotoğrafları `public/menu/<slug>/` altına koy.
2. `lib/menu-data/<slug>.ts` oluştur, `hocaoglu.ts`'i şablon al.
3. `lib/menu-data/index.ts` içindeki `restaurants` dizisine ekle.

Route otomatik gelir: `/menu/<slug>`. `generateStaticParams` her esnaf için
build sırasında statik HTML üretir; listede olmayan slug'lar `notFound()` ile
404 döner. Panel de otomatik olarak yeni esnafı listeler.

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
- **Panelde ürün ekleme/silme yok.** Kapsam bilinçli olarak fiyat ve tükendi
  ile sınırlı tutuldu; ürün listesi kodda değişir.
- **Next.js 14 açık güvenlik uyarıları taşıyor.** 14.2.35 dalın son sürümü ama
  bir kısmı yalnızca 15.5.21+ ile kapanıyor. `npm audit` ile görülebilir.
