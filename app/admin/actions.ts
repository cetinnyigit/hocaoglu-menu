'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  SESSION_COOKIE,
  adminPassword,
  createSession,
  isValidSession,
  timingSafeEqual,
} from '@/lib/auth'
import { getRestaurant } from '@/lib/menu-data'
import { collectEditableEntries } from '@/lib/menu-key'
import {
  overridesTag,
  readOverridesFresh,
  writeOverrides,
} from '@/lib/menu-store'
import type { ItemOverride } from '@/lib/menu-data/types'

/** Açık yönlendirme olmasın diye yalnızca panel içi yollara izin veriyoruz. */
function safeNext(value: FormDataEntryValue | null): string {
  const target = typeof value === 'string' ? value : ''
  return target.startsWith('/admin') && !target.startsWith('//')
    ? target
    : '/admin'
}

export async function login(formData: FormData) {
  const next = safeNext(formData.get('devam'))
  const entered = String(formData.get('sifre') ?? '')

  if (!timingSafeEqual(entered, adminPassword())) {
    redirect(`/admin/giris?hata=1&devam=${encodeURIComponent(next)}`)
  }

  const session = await createSession()
  cookies().set(SESSION_COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  })

  redirect(next)
}

export async function logout() {
  cookies().delete(SESSION_COOKIE)
  redirect('/admin/giris')
}

export async function saveMenu(slug: string, formData: FormData) {
  // Middleware zaten koruyor; server action doğrudan da çağrılabildiği için
  // yetkiyi burada tekrar doğruluyoruz.
  if (!(await isValidSession(cookies().get(SESSION_COOKIE)?.value))) {
    redirect('/admin/giris')
  }

  const restaurant = getRestaurant(slug)
  if (!restaurant) redirect('/admin')

  const current = await readOverridesFresh(slug)
  const items: Record<string, ItemOverride> = {}

  // Formdan gelen anahtarlara güvenmiyoruz: menüde gerçekten var olan
  // ürünleri geziyor, karşılığındaki alanı okuyoruz.
  for (const entry of collectEditableEntries(restaurant)) {
    const rawPrice = formData.get(`fiyat:${entry.key}`)
    const price = typeof rawPrice === 'string' ? rawPrice.trim() : ''
    const soldOut = formData.get(`tukendi:${entry.key}`) === 'on'

    const override: ItemOverride = {}
    if (price) override.price = price.slice(0, 24)
    if (soldOut) override.soldOut = true

    // Boş alanları yazmıyoruz; JSON gereksiz şişmesin ve "değer yok"
    // durumu koddaki varsayılana düşsün.
    if (Object.keys(override).length > 0) items[entry.key] = override
  }

  const unchanged =
    JSON.stringify(current.items) === JSON.stringify(items)

  if (!unchanged) {
    await writeOverrides(slug, items)
    // Önce önbellekli okumayı tazele, sonra statik menü sayfasını yeniden
    // ürettir. Sırası önemli: ters olursa sayfa eski veriyle üretilir.
    revalidateTag(overridesTag(slug))
    // Dinamik segment için yol kalıbı verilmeli; düz '/menu/<slug>' geçilince
    // sayfa geçersiz kılınıyor ama yeniden üretilmiyordu.
    revalidatePath('/menu/[slug]', 'page')
  }

  redirect(`/admin/${slug}?kaydedildi=1`)
}
