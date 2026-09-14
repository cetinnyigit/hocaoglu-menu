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
import { collectEditableEntries, newItemKey } from '@/lib/menu-key'
import { applyOverrides } from '@/lib/menu-merge'
import {
  overridesTag,
  readOverridesFresh,
  writeOverrides,
} from '@/lib/menu-store'
import type {
  AddedItem,
  ItemOverride,
  Restaurant,
} from '@/lib/menu-data/types'

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

/** Ürün adı için üst sınır; menüde tek satıra sığması için kısa tutuluyor. */
const NAME_MAX = 60

/**
 * Bir esnafın panelden ekleyebileceği ürün sayısı. Menüyü kodda tutmanın
 * anlamı kalmayacak kadar şişmesini ve JSON'un büyümesini engelliyor.
 */
const ADDED_MAX = 100

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

/**
 * Panelden eklenen ürünlerin yeni hâlini çıkarır: silinenler düşer,
 * kalanların adı güncellenir, "yeni ürün" kutusuna yazılanlar eklenir.
 *
 * Üçü de tek formda ve tek kaydetmede yapılıyor. Ekleme için ayrı bir
 * aksiyon yok; böylece esnaf adı yazıp yanlışlıkla "Kaydet"e bassa da ürün
 * kayboluyormuş gibi olmuyor, iki buton da aynı işi yapıyor.
 */
function nextAdded(
  restaurant: Restaurant,
  current: AddedItem[],
  formData: FormData,
): { added: AddedItem[]; full: boolean } {
  const removed = new Set(
    current
      .map((entry) => entry.key)
      .filter((key) => formData.get(`sil:${key}`) === 'on'),
  )

  const added = current
    .filter((entry) => !removed.has(entry.key))
    .map((entry) => {
      // Ad kutusu boşsa dokunmuyoruz: adsız ürün menüde boş satır olurdu.
      const name = text(formData.get(`ad:${entry.key}`))
      return name ? { ...entry, name: name.slice(0, NAME_MAX) } : entry
    })

  let full = false

  // Alan adı hedefi taşıyor: yeniad:<bolum>:<grup>. Böylece hangi grubun
  // kutusuna yazıldığı ayrıca gönderilmek zorunda kalmıyor ve birden fazla
  // gruba aynı anda ürün eklenebiliyor.
  const fresh: Array<[string, string]> = []
  formData.forEach((value, field) => {
    if (!field.startsWith('yeniad:')) return
    const name = typeof value === 'string' ? value.trim() : ''
    if (name) fresh.push([field, name])
  })

  for (const [field, name] of fresh) {
    if (added.length >= ADDED_MAX) {
      full = true
      break
    }

    const [section, group] = field.slice('yeniad:'.length).split(':')
    // Hedef bölüm gerçekten var mı — alan adı tarayıcıdan geliyor.
    if (!section || !group) continue
    if (!restaurant.sections.some((s) => s.id === section)) continue

    added.push({
      key: newItemKey(),
      section,
      group,
      name: name.slice(0, NAME_MAX),
    })
  }

  return { added, full }
}

export async function saveMenu(slug: string, formData: FormData) {
  // Middleware zaten koruyor; server action doğrudan da çağrılabildiği için
  // yetkiyi burada tekrar doğruluyoruz. Sadece "giriş yapmış mı" değil,
  // "bu menüye yetkili mi" — yoksa bir esnaf action'ı elle çağırıp
  // başkasının fiyatlarını yazabilirdi.
  const session = await readSession(cookies().get(SESSION_COOKIE)?.value)
  if (!session) redirect('/admin/giris')
  if (!canEdit(session, slug)) redirect('/admin')

  const base = getRestaurant(slug)
  if (!base) redirect('/admin')

  const current = await readOverridesFresh(slug)
  const { added, full } = nextAdded(base, current.added, formData)

  /**
   * Ürün listesini eklenenler yerleştirildikten sonraki menüden geziyoruz:
   * aynı kaydetmede eklenen ürünün fiyatı da bu turda yazılsın, silinen
   * ürünün kaydı da kendiliğinden düşsün.
   */
  const restaurant = applyOverrides(base, { ...current, added })
  const items: Record<string, ItemOverride> = {}
  const seen = new Set<string>()

  // Formdan gelen anahtarlara güvenmiyoruz: menüde gerçekten var olan
  // ürünleri geziyor, karşılığındaki alanı okuyoruz.
  for (const entry of collectEditableEntries(restaurant)) {
    seen.add(entry.key)

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

  /**
   * Yeri kalmamış ürünlerin kaydını olduğu gibi taşıyoruz. Bölümü koddan
   * kaldırılmış ürün menüye basılmıyor, dolayısıyla yukarıdaki turda hiç
   * gezilmiyor; korunmasa ilk kaydetmede fiyatı ve fotoğrafı sessizce
   * silinirdi. Bölüm geri gelirse ürün eski hâliyle görünsün.
   */
  for (const entry of added) {
    if (seen.has(entry.key)) continue
    const kept = current.items[entry.key]
    if (kept) items[entry.key] = kept
  }

  const unchanged =
    JSON.stringify(current.items) === JSON.stringify(items) &&
    JSON.stringify(current.added) === JSON.stringify(added)

  if (!unchanged) {
    try {
      await writeOverrides(slug, items, added)
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

  // Sınıra takılan ürün adı sessizce yutulmasın; esnaf yazdığının
  // kaydedilmediğini görmeli.
  if (full) {
    redirect(
      `/admin/${slug}?hata=${encodeURIComponent(
        `Eklenebilecek ürün sınırına ulaşıldı (${ADDED_MAX}). Kullanmadığın ürünleri sil.`,
      )}`,
    )
  }

  redirect(`/admin/${slug}?kaydedildi=1`)
}
