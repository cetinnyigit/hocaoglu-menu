# Esnaf Menü

NFC kartla açılan dijital esnaf menüleri. Next.js 14 (App Router) + TypeScript + Tailwind.

Ana alan adı: `cetinnyigit.com`. Esnaf varsayılan olarak
`cetinnyigit.com/menu/<slug>` adresinde yayınlanır; kendi alan adını almış
esnafta menü o alan adının kökünde açılır (bkz. [Esnafa özel alan adı]
(#esnafa-özel-alan-adı)).

Menüler: `hocaoglupasta.com` (Hocaoğlu), `/menu/ay` (Ay Döner) ·
Fiyat paneli: `/admin` · Tanıtım: `/`

Ana sayfa bilinçli olarak tanıtım sayfası — buradan hiçbir müşteri menüsüne
veya panele bağlantı verilmiyor, müşteriler birbirinin menüsünü görmesin diye.

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
  ay.ts                    Ay Döner & Köfte menüsü
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

Panele sadece sayı yazmak yeterli; **TL gösterim anında eklenir**
(`lib/format-price.ts`). Değer zaten "TL" ya da "₺" içeriyorsa olduğu gibi
bırakılır. Biçimlendirme kayıt anında yapılmaz — panelde ham değer görünür,
düzenlemesi kolay olsun diye.

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

`/admin` — şifreyle giriş, 12 saatlik imzalı çerez oturumu. Middleware
`/admin` altındaki her şeyi korur, `robots.txt` dizine eklenmesini engeller.

**Her esnafın kendi şifresi var.** Girilen şifre oturumun kapsamını belirler
(`lib/auth.ts`): esnaf şifresiyle girenin çerezinde kendi slug'ı yazar ve
yalnızca `/admin/<kendi-slug>` açılır. Başkasının paneline gitmeye çalışırsa
kendi paneline geri döner. Kapsam çerezin imzasının içinde, elle
değiştirilemez.

Gerekli ortam değişkenleri:

| Değişken | Ne işe yarar |
| --- | --- |
| `ADMIN_PASSWORD_<SLUG>` | O esnafa verilecek şifre, sadece kendi menüsü |
| `ADMIN_PASSWORD` | Sahibin ana şifresi, tüm menüler. Müşteriye verilmez |
| `ADMIN_SESSION_SECRET` | Oturum çerezini imzalar, en az 16 karakter |
| Blob kimliği | Vercel'de store bağlanınca otomatik gelir, aşağıya bak |

Slug → değişken adı: harfler büyür, tire alt çizgi olur.
`hocaoglu` → `ADMIN_PASSWORD_HOCAOGLU`,
`tavuk-dunyasi` → `ADMIN_PASSWORD_TAVUK_DUNYASI`.

Her esnafa farklı şifre ver. Aynı şifreyi iki esnafa verirsen ikisi de listede
önce gelen menüye düşer.

Blob kimlik doğrulamasının iki yolu var, `lib/menu-store.ts` ikisini de kabul
eder:

- **`BLOB_STORE_ID` + `VERCEL_OIDC_TOKEN`** — Vercel'in güncel modeli. Store'u
  projeye bağlayınca store id enjekte edilir, OIDC token'ı çalışma anında
  üretilir. Bu modelde ortamda `BLOB_READ_WRITE_TOKEN` **hiç bulunmaz**, bu
  normaldir. Projede OIDC (Secure Backend Access) açık olmalı.
- **`BLOB_READ_WRITE_TOKEN`** — uzun ömürlü token. Lokal geliştirmede
  `.env.local`'e koymak için pratik.

Blob store'u oluşturduktan sonra **projeye bağlayıp yeniden deploy et** —
`BLOB_READ_WRITE_TOKEN` ancak o zaman fonksiyona geçer. Token yokken panel
açılır ama kaydetme çalışmaz; panel bunu kırmızı bir uyarıyla söyler.

Blob store **Private** olarak oluşturulmalı. `lib/menu-store.ts` blob'u
`access: 'private'` ile yazıp `get()` ile okuyor; erişim seviyesi store'unkiyle
eşleşmezse işlem reddedilir. Fiyat dosyası herkese açık bir URL'den okunamaz,
istekleri SDK token ile imzalar.

Eksik değişken varsa `/admin/giris` 500 yerine hangi değişkenin eksik
olduğunu söyleyen bir sayfa gösterir.

## Yeni esnaf ekleme

1. Slug seç — **sadece ASCII**: `tavuk-dunyasi`, `tavukdunyası` değil. Türkçe
   karakter URL'de yüzde kodlamasına dönüşür, QR'da yer kaplar, elle yazılamaz.
2. Fotoğrafları `public/menu/<slug>/` altına koy.
3. `lib/menu-data/<slug>.ts` oluştur, `hocaoglu.ts`'i şablon al.
4. `lib/menu-data/index.ts` içindeki `restaurants` dizisine ekle.
5. `npm run check:keys` — anahtar çakışması var mı.
6. Vercel'e `ADMIN_PASSWORD_<SLUG>` ekle, deploy et.
7. QR üret: `npm run qr -- <slug>` (adresi kendi bulur).

Route otomatik gelir: `/menu/<slug>`. `generateStaticParams` her esnaf için
build sırasında statik HTML üretir; listede olmayan slug'lar `notFound()` ile
404 döner.

### Esnafa özel alan adı

Bir esnaf kendi alan adını aldığında menü ayrı bir projeye taşınmaz — aynı
proje o alan adına da cevap verir. Kod tek yerde kalır, panel ve fiyat deposu
ortak çalışmaya devam eder.

1. `lib/domains.ts` içindeki `RESTAURANT_DOMAINS`'e bir satır ekle:
   `hocaoglu: 'hocaoglupasta.com'`. Tek doğruluk kaynağı burasıdır.
2. Vercel → proje → Settings → Domains → alan adını **bu projeye** ekle
   (yeni proje açma). `www` varyantını da ekleyip apex'e yönlendir.
3. Alan adı sağlayıcısında Vercel'in verdiği A / CNAME kaydını gir.
4. QR'ı yeniden üret: `npm run qr -- <slug>`.

`middleware.ts` gerisini halleder:

| İstek | Sonuç |
| --- | --- |
| `hocaoglupasta.com/` | menü (rewrite — adres çubuğunda `/menu/...` görünmez) |
| `hocaoglupasta.com/menu/*` | `/` → 308 |
| `hocaoglupasta.com/admin` | panel, normal çalışır |
| `cetinnyigit.com/menu/hocaoglu` | `https://hocaoglupasta.com` → 308 |

Menünün canonical'ı ve Open Graph adresi de kendi alan adına döner, aynı menü
arama motoruna iki ayrı adres olarak görünmez.

`lib/domains.ts` middleware'den import edildiği için Edge paketine giriyor —
oraya menü verisi bağlama, sadece düz eşleme tut.

### Esnafa özel renkler

Varsayılan krem/kahve palet dışına çıkmak gerekirse `globals.css`'e bir
`.brand-<ad>` sınıfı yazılır ve esnafın veri dosyasında `palette: '<ad>'`
denir; `/menu/[slug]` sayfası içeriği o sınıfla sarar, değişkenler oradan
miras alınır. Diğer menüler etkilenmez. Örnek: Ay Döner'in lacivert + sarı
kimliği (`.brand-ay`, `theme-navy`, `theme-gold`).

`--cream` bilerek sitenin varsayılanıyla aynı bırakıldı: sarmalayıcı div
sayfanın tamamını kaplamadığı için farklı bir zemin rengi altta dikiş
gösterir.

## QR kartlar

`npm run qr -- <slug>` → `qr/<slug>-qr.svg` ve `qr/<slug>-qr.png`. Adres
`lib/domains.ts`'ten türetilir; kendi alan adı olan esnafta kart o alan adına
basılır. Adresi elle vermek gerekirse: `npm run qr -- <url> <ad>`.

Matbaaya **SVG**'yi ver. Hata düzeltme seviyesi H (%30), 4 modül sessiz alan.
En az 2 cm basılmalı, saf siyah/beyaz, mat lamine. Sessiz alan kırpılmamalı.

Basılı adres sonradan değiştirilemez: alan adı değişirse tüm kartlar geçersiz
olur.

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
