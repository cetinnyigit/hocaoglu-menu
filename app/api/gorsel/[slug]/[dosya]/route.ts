import { NextResponse } from 'next/server'
import { readItemImage } from '@/lib/menu-store'

/**
 * Panelden yüklenen ürün görsellerini servis eder.
 *
 * Blob deposu private olduğu için görselin herkese açık bir adresi yok;
 * müşteriye buradan veriliyor. Dosya adında zaman damgası var, yani içerik
 * bir daha değişmiyor — immutable ve uzun süreli önbellekle işaretliyoruz,
 * böylece istek CDN'de kalıyor ve bu fonksiyon neredeyse hiç çalışmıyor.
 */

export const runtime = 'nodejs'

/** writeItemImage'in ürettiği ad: <anahtar>-<zaman>.jpg */
const NAME_PATTERN = /^[\w.-]+\.jpg$/
const SLUG_PATTERN = /^[a-z0-9-]+$/

export async function GET(
  _request: Request,
  { params }: { params: { slug: string; dosya: string } },
) {
  const { slug, dosya } = params
  if (!SLUG_PATTERN.test(slug) || !NAME_PATTERN.test(dosya)) {
    return new NextResponse(null, { status: 404 })
  }

  const stream = await readItemImage(slug, dosya)
  if (!stream) return new NextResponse(null, { status: 404 })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
