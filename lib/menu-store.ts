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

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Vercel'de dosya sistemi salt okunur; .data/ yedeği yalnızca lokalde
 * anlamlı. Token'sız bir deploy'da sessizce oraya düşersek kaydetme
 * anlaşılmaz bir 500 ile patlıyor — sebebi baştan söylüyoruz.
 */
function onVercel(): boolean {
  return Boolean(process.env.VERCEL)
}

function usingBlob(): boolean {
  return isBlobConfigured()
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
  if (!usingBlob()) return readLocal(slug)

  try {
    // useCache: false — kaydettikten hemen sonra CDN'deki eski kopyayı
    // okumayalım. Bu çağrı sadece build/yeniden üretim sırasında yapılıyor,
    // ziyaretçi isteğinde değil; maliyeti önemsiz.
    const result = await get(blobPath(slug), {
      access: ACCESS,
      useCache: false,
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
 */
export function readOverrides(slug: string): Promise<MenuOverrides> {
  return unstable_cache(
    () => readOverridesFresh(slug),
    ['menu-overrides', slug],
    { tags: [overridesTag(slug)] },
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

  if (!usingBlob()) {
    if (onVercel()) {
      throw new Error(
        'BLOB_READ_WRITE_TOKEN tanımlı değil. Vercel projesine bir Blob store ' +
          '(Private) bağla ve yeniden deploy et — değişken ancak o zaman ' +
          'fonksiyona geçer.',
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
  })

  return data
}
