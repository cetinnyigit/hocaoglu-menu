/**
 * Esnafa özel alan adları.
 *
 * Bir esnaf kendi alan adını aldığında buraya bir satır eklenir; gerisi
 * (kök adresin menüye dönmesi, eski adresin yönlenmesi, canonical etiketi,
 * QR'ın hangi adrese basılacağı) bu tablodan türer.
 *
 * DİKKAT: Bu dosya middleware'den import ediliyor, yani Edge ortamına
 * giriyor. Bu yüzden bilerek yalnızca düz veri tutuyor — lib/menu-data
 * altındaki menü dosyalarını buraya bağlama, hepsi Edge paketine girer.
 *
 * Alan adı www'suz ve protokolsüz yazılır; www ve port eşleştirme sırasında
 * kırpılıyor.
 */
export const RESTAURANT_DOMAINS: Record<string, string> = {
  hocaoglu: 'hocaoglupasta.com',
}

/** Kendi alan adı olmayan esnafların menüsü bu adresin altında durur. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cetinnyigit.com'

/** "www.Ornek.com:3000" → "ornek.com". Eşleştirme öncesi normalleştirme. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return ''
  return host.toLowerCase().split(':')[0].replace(/^www\./, '')
}

/** İstek bu alan adına geldiyse hangi esnafın menüsü açılmalı? */
export function slugForHost(host: string | null | undefined): string | undefined {
  const normalized = normalizeHost(host)
  if (!normalized) return undefined

  for (const [slug, domain] of Object.entries(RESTAURANT_DOMAINS)) {
    if (normalized === normalizeHost(domain)) return slug
  }
  return undefined
}

export function restaurantDomain(slug: string): string | undefined {
  return RESTAURANT_DOMAINS[slug]
}

/**
 * Menünün herkese açık tek adresi. Kendi alan adı varsa kökü, yoksa ana
 * sitedeki /menu/<slug> yolu. QR kartlar ve canonical etiketi bunu kullanır.
 */
export function restaurantUrl(slug: string): string {
  const domain = restaurantDomain(slug)
  return domain ? `https://${normalizeHost(domain)}` : `${SITE_URL}/menu/${slug}`
}
