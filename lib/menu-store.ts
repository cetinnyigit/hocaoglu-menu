import { get, put } from '@vercel/blob'
import { unstable_cache } from 'next/cache'
import type { ItemOverride, MenuOverrides } from './menu-data/types'

/**
 * Panelden kaydedilen fiyat/tükendi bilgisinin deposu.
 *
 * Üretimde Vercel Blob'da tek bir JSON dosyası tutulur. Lokal geliştirmede
 * BLOB_READ_WRITE_TOKEN olmadığı için .data/ altındaki bir dosyaya düşer,
 * böylece panel token olmadan da denenebilir.
 *
 * Blob private: dosya herkese açık bir URL'den okunamaz, SDK isteği
 * BLOB_READ_WRITE_TOKEN ile imzalar.
 */

const ACCESS = 'private' as const

const EMPTY: MenuOverrides = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  items: {},
}

function blobPath(slug: string): string {
  return `menu-overrides/${slug}.json`
}

/**
 * Blob kimlik doğrulamasının iki yolu var ve SDK ikisini de kabul ediyor:
 *
 *  1. BLOB_READ_WRITE_TOKEN — uzun ömürlü token (eski model, lokal .env).
 *  2. BLOB_STORE_ID + VERCEL_OIDC_TOKEN — Vercel'in güncel modeli; store'u
 *     projeye bağlayınca store id enjekte edilir, OIDC token'ı çalışma anında
 *     üretilir. Bu durumda ortamda BLOB_READ_WRITE_TOKEN hiç bulunmaz.
 *
 * `token` dönmediğimiz durumlarda SDK kendi çözümlemesini yapıyor.
 *
 * Store'a "Environment Variables Prefix" verildiyse değişken adı
 * ONEK_BLOB_READ_WRITE_TOKEN olabilir; onu da son eke bakıp yakalıyoruz.
 */
function blobAuth(): { token?: string; source: string } | null {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return { source: 'BLOB_READ_WRITE_TOKEN' }
  }

  const prefixed = blobTokenCandidates()[0]
  if (prefixed) return { token: process.env[prefixed], source: prefixed }

  if (process.env.BLOB_STORE_ID) return { source: 'BLOB_STORE_ID (OIDC)' }

  return null
}

/** Yalnızca değişken adları — token değerleri hiçbir yere sızdırılmaz. */
export function blobTokenCandidates(): string[] {
  return Object.keys(process.env).filter(
    (key) => key.endsWith('BLOB_READ_WRITE_TOKEN') && process.env[key],
  )
}

export function isBlobConfigured(): boolean {
  return blobAuth() !== null
}

/**
 * Vercel'de dosya sistemi salt okunur; .data/ yedeği yalnızca lokalde
 * anlamlı. Token'sız bir deploy'da sessizce oraya düşersek kaydetme
 * anlaşılmaz bir 500 ile patlıyor — sebebi baştan söylüyoruz.
 */
function onVercel(): boolean {
  return Boolean(process.env.VERCEL)
}


// -------------------------------------------------------------- ürün görseli

/**
 * Panelden yüklenen ürün görselini kalıcı bir adrese yazar ve o adresi döner.
 *
 * Fiyat JSON'u private tutuluyor ama görsel herkese açık olmalı: menüyü açan
 * müşterinin tarayıcısı doğrudan indiriyor.
 *
 * Dosya adına zaman damgası ekleniyor — aynı ürünün görseli değiştirildiğinde
 * adres de değişsin, CDN'de kalan eski kopya gösterilmesin.
 */
export async function writeItemImage(
  slug: string,
  key: string,
  data: ArrayBuffer,
): Promise<string> {
  const safeKey = key.replace(/[^a-zA-Z0-9-]/g, '_')
  const name = `${safeKey}-${Date.now()}.jpg`
  const auth = blobAuth()

  if (!auth) {
    if (onVercel()) {
      throw new Error(
        'Blob deposu bağlı değil, görsel yüklenemez. Vercel projesine bir ' +
          'Blob store bağla ve yeniden deploy et.',
      )
    }
    return writeLocalImage(slug, name, data)
  }

  const result = await put(`menu-images/${slug}/${name}`, data, {
    access: 'public',
    contentType: 'image/jpeg',
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(auth.token ? { token: auth.token } : {}),
  })

  return result.url
}

/** Lokal geliştirme: public/ altına yazar, menüde /menu/... yolundan okunur. */
async function writeLocalImage(
  slug: string,
  name: string,
  data: ArrayBuffer,
): Promise<string> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const dir = path.join(process.cwd(), 'public', 'menu', slug, 'urun')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), Buffer.from(data))
  return `/menu/${slug}/urun/${name}`
}

function parse(raw: string): MenuOverrides {
  const data = JSON.parse(raw) as Partial<MenuOverrides>
  if (data.version !== 1 || typeof data.items !== 'object' || !data.items) {
    // Bozuk/eski içerikte menüyü çökertmek yerine fiyatsız hâline dönüyoruz.
    return EMPTY
  }
  return {
    version: 1,
    updatedAt: data.updatedAt ?? EMPTY.updatedAt,
    items: data.items,
  }
}

// ---------------------------------------------------------------- lokal dosya

async function localFile(slug: string): Promise<string> {
  const path = await import('node:path')
  return path.join(process.cwd(), '.data', `menu-overrides-${slug}.json`)
}

async function readLocal(slug: string): Promise<MenuOverrides> {
  const fs = await import('node:fs/promises')
  try {
    return parse(await fs.readFile(await localFile(slug), 'utf8'))
  } catch {
    return EMPTY
  }
}

async function writeLocal(slug: string, data: MenuOverrides): Promise<void> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const file = await localFile(slug)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8')
}

// ---------------------------------------------------------------------- genel

/** revalidateTag ile bu etiketi tazeliyoruz. */
export function overridesTag(slug: string): string {
  return `menu-overrides:${slug}`
}

/** Depoya doğrudan gider. Panel gibi her zaman güncel veri isteyen yerler için. */
export async function readOverridesFresh(
  slug: string,
): Promise<MenuOverrides> {
  const auth = blobAuth()
  if (!auth) return readLocal(slug)

  try {
    // useCache: false — kaydettikten hemen sonra CDN'deki eski kopyayı
    // okumayalım. Bu çağrı sadece build/yeniden üretim sırasında yapılıyor,
    // ziyaretçi isteğinde değil; maliyeti önemsiz.
    const result = await get(blobPath(slug), {
      access: ACCESS,
      useCache: false,
      ...(auth.token ? { token: auth.token } : {}),
    })
    if (!result || result.statusCode !== 200) return EMPTY
    return parse(await new Response(result.stream).text())
  } catch {
    // Henüz hiç kayıt yapılmamışsa blob yoktur — menü koddaki hâliyle çıkar.
    return EMPTY
  }
}

/**
 * Menü sayfası için önbellekli okuma.
 *
 * Sayfayı statik tutmanın anahtarı bu: blob okuması unstable_cache içine
 * alınmasa, SDK'nın kendi fetch'i sayfayı dinamik render'a düşürür ve her
 * ziyarette depoya gidilirdi. Kayıt sonrası revalidateTag ile tazeleniyor.
 *
 * revalidate şart: bu önbellek .next/cache'e yazılıyor ve Vercel'de build
 * cache'i deploy'lar arasında korunuyor. Süre sınırı olmadan eski bir sonuç
 * (ör. depo henüz boşken okunan hâli) yeni deploy'larda da kullanılmaya
 * devam ediyordu.
 */
/**
 * Kısa tutuluyor: bu okuma yalnızca sayfa yeniden üretilirken yapılıyor,
 * ziyaretçi isteğinde değil. Asıl güncelleme zaten kayıt anında
 * revalidateTag ile anında oluyor; bu yalnızca güvenlik ağı.
 */
const OVERRIDES_TTL_SECONDS = 60

export function readOverrides(slug: string): Promise<MenuOverrides> {
  return unstable_cache(
    () => readOverridesFresh(slug),
    ['menu-overrides', slug],
    { tags: [overridesTag(slug)], revalidate: OVERRIDES_TTL_SECONDS },
  )()
}

export async function writeOverrides(
  slug: string,
  items: Record<string, ItemOverride>,
): Promise<MenuOverrides> {
  const data: MenuOverrides = {
    version: 1,
    updatedAt: new Date().toISOString(),
    items,
  }

  const auth = blobAuth()

  if (!auth) {
    if (onVercel()) {
      throw new Error(
        'Blob kimlik bilgisi bulunamadı: ne BLOB_READ_WRITE_TOKEN ne de ' +
          'BLOB_STORE_ID tanımlı. Vercel projesine Private bir Blob store ' +
          'bağla ve yeniden deploy et.',
      )
    }
    await writeLocal(slug, data)
    return data
  }

  await put(blobPath(slug), JSON.stringify(data), {
    access: ACCESS,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    ...(auth.token ? { token: auth.token } : {}),
  })

  return data
}
