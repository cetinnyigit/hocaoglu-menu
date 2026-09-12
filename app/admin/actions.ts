'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  OWNER_SCOPE,
  SESSION_COOKIE,
  canEdit,
  createSession,
  readSession,
  resolveScope,
} from '@/lib/auth'
import { getRestaurant, getRestaurantSlugs } from '@/lib/menu-data'
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
  const requested = safeNext(formData.get('devam'))
  const entered = String(formData.get('sifre') ?? '')

  const scope = resolveScope(entered, getRestaurantSlugs())
  if (!scope) {
    redirect(`/admin/giris?hata=1&devam=${encodeURIComponent(requested)}`)
  }

  // İstenen sayfa bu şifrenin yetkisi dışındaysa (ör. esnaf başkasının
  // panelinin linkine tıkladı) kendi paneline gönder.
  const requestedSlug = requested.split('/')[2]
  const next =
    !requestedSlug || canEdit({ scope }, requestedSlug)
      ? requested
      : scope === OWNER_SCOPE
        ? '/admin'
        : `/admin/${scope}`

  const session = await createSession(scope)
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

/** Panelde içerik metni için üst sınır; ItemDetailFields ile aynı. */
const DESC_MAX = 400

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Görselin adresi tarayıcıdan geliyor, o yüzden doğrulanıyor: yalnızca
 * kendi yükleme uç noktamızın ürettiği iki biçim kabul ediliyor — depodaki
 * görseli servis eden /api/gorsel yolu ya da lokal geliştirmede public/
 * altındaki yol. Aksi hâlde panele erişen biri menüye dışarıdan görsel
 * bindirebilirdi.
 */
function itemImage(
  formData: FormData,
  key: string,
): ItemOverride['image'] | undefined {
  const src = text(formData.get(`gorsel:${key}`))
  if (!src) return undefined

  const allowed =
    /^\/api\/gorsel\/[a-z0-9-]+\/[\w.-]+\.jpg$/.test(src) ||
    /^\/menu\/[a-z0-9-]+\/urun\/[\w.-]+$/.test(src)
  if (!allowed) return undefined

  const width = Number(text(formData.get(`gorselg:${key}`)))
  const height = Number(text(formData.get(`gorsely:${key}`)))
  if (!Number.isInteger(width) || width <= 0) return undefined
  if (!Number.isInteger(height) || height <= 0) return undefined

  return { src, width, height }
}

export async function saveMenu(slug: string, formData: FormData) {
  // Middleware zaten koruyor; server action doğrudan da çağrılabildiği için
  // yetkiyi burada tekrar doğruluyoruz. Sadece "giriş yapmış mı" değil,
  // "bu menüye yetkili mi" — yoksa bir esnaf action'ı elle çağırıp
  // başkasının fiyatlarını yazabilirdi.
  const session = await readSession(cookies().get(SESSION_COOKIE)?.value)
  if (!session) redirect('/admin/giris')
  if (!canEdit(session, slug)) redirect('/admin')

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

    const desc = text(formData.get(`aciklama:${entry.key}`))
    if (desc) override.desc = desc.slice(0, DESC_MAX)

    const calories = Number(text(formData.get(`kalori:${entry.key}`)))
    if (Number.isInteger(calories) && calories > 0 && calories <= 9999) {
      override.calories = calories
    }

    const image = itemImage(formData, entry.key)
    if (image) override.image = image

    // Boş alanları yazmıyoruz; JSON gereksiz şişmesin ve "değer yok"
    // durumu koddaki varsayılana düşsün.
    if (Object.keys(override).length > 0) items[entry.key] = override
  }

  const unchanged =
    JSON.stringify(current.items) === JSON.stringify(items)

  if (!unchanged) {
    try {
      await writeOverrides(slug, items)
    } catch (error) {
      // Yakalanmazsa kullanıcı yalnızca boş bir 500 görüyor ve sebebi
      // Vercel loglarına bakmadan anlaşılmıyor. Mesajı panele taşıyoruz.
      const message =
        error instanceof Error ? error.message : 'Bilinmeyen hata'
      console.error(`[saveMenu] ${slug} kaydedilemedi:`, error)
      redirect(
        `/admin/${slug}?hata=${encodeURIComponent(message.slice(0, 300))}`,
      )
    }

    // Önce önbellekli okumayı tazele, sonra statik menü sayfasını yeniden
    // ürettir. Sırası önemli: ters olursa sayfa eski veriyle üretilir.
    revalidateTag(overridesTag(slug))
    // Dinamik segment için yol kalıbı verilmeli; düz '/menu/<slug>' geçilince
    // sayfa geçersiz kılınıyor ama yeniden üretilmiyordu.
    revalidatePath('/menu/[slug]', 'page')
  }

  redirect(`/admin/${slug}?kaydedildi=1`)
}
