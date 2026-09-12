import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, canEdit, readSession } from '@/lib/auth'
import { getRestaurant } from '@/lib/menu-data'
import { collectEditableEntries } from '@/lib/menu-key'
import { writeItemImage } from '@/lib/menu-store'

/**
 * Panelden ürün görseli yükleme.
 *
 * Server action yerine route handler: server action gövdeleri varsayılan
 * 1 MB sınırına takılıyor. Tarayıcı görseli göndermeden önce küçültüyor
 * (bkz. components/admin/ItemDetailFields.tsx), buradaki sınır yalnızca
 * güvenlik ağı.
 */

export const runtime = 'nodejs'
/** Küçültülmüş bir menü fotoğrafı ~200 KB; bunun üstü kötüye kullanımdır. */
const MAX_BYTES = 5 * 1024 * 1024

function bad(message: string, status = 400) {
  return NextResponse.json({ hata: message }, { status })
}

/** width/height menüde en-boy oranı için kullanılıyor; makul aralıkta olmalı. */
function dimension(value: FormDataEntryValue | null): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 && n <= 10000 ? n : null
}

export async function POST(request: Request) {
  const form = await request.formData()
  const slug = String(form.get('slug') ?? '')
  const key = String(form.get('anahtar') ?? '')

  // Yetki kontrolü middleware'e bırakılmıyor: bu yol /admin altında değil.
  const session = await readSession(cookies().get(SESSION_COOKIE)?.value)
  if (!canEdit(session, slug)) return bad('Yetkisiz istek', 403)

  const restaurant = getRestaurant(slug)
  if (!restaurant) return bad('Menü bulunamadı', 404)

  // Formdan gelen anahtara güvenmiyoruz: menüde gerçekten var olmalı.
  const known = collectEditableEntries(restaurant).some((e) => e.key === key)
  if (!known) return bad('Ürün bulunamadı')

  const file = form.get('dosya')
  if (!(file instanceof File)) return bad('Dosya gelmedi')
  if (!file.type.startsWith('image/')) return bad('Yalnızca görsel yüklenebilir')
  if (file.size > MAX_BYTES) return bad('Görsel çok büyük')

  const width = dimension(form.get('genislik'))
  const height = dimension(form.get('yukseklik'))
  if (!width || !height) return bad('Görsel ölçüsü okunamadı')

  try {
    const src = await writeItemImage(slug, key, await file.arrayBuffer())
    return NextResponse.json({ src, width, height })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata'
    console.error(`[gorsel] ${slug}/${key} yüklenemedi:`, error)
    return bad(message, 500)
  }
}
