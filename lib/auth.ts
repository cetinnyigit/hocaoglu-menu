/**
 * Panel girişi: esnaf başına şifre + imzalı çerez.
 *
 * Kullanıcı hesabı yok. Her esnafın şifresi kendi ortam değişkeninde durur
 * (ADMIN_PASSWORD_<SLUG>), giriş yapılınca HMAC ile imzalanmış bir oturum
 * çerezi bırakılır. Çerez hangi esnafa yetkili olduğunu da taşır — böylece
 * bir esnaf başkasının fiyatlarını göremez/değiştiremez.
 *
 * ADMIN_PASSWORD ise sahibin ana şifresi; tüm menülere yetkilidir.
 *
 * İmzalama Web Crypto ile yapılıyor ki hem Node hem de middleware'in Edge
 * ortamında çalışsın.
 */

export const SESSION_COOKIE = 'menu_admin'
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 saat

/** Tüm menülere yetkili oturumun kapsamı. */
export const OWNER_SCOPE = '*'

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value || value.length < 16) {
    throw new Error(
      'ADMIN_SESSION_SECRET tanımlı değil veya 16 karakterden kısa. ' +
        'Vercel proje ayarlarından uzun ve rastgele bir değer ekle.',
    )
  }
  return value
}

/**
 * hocaoglu → ADMIN_PASSWORD_HOCAOGLU
 * tavuk-dunyasi → ADMIN_PASSWORD_TAVUK_DUNYASI
 */
export function passwordEnvName(slug: string): string {
  return `ADMIN_PASSWORD_${slug.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
}

/** Sahibin ana şifresi. Tanımlı değilse tüm-menü girişi kapalı demektir. */
export function ownerPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined
}

export function restaurantPassword(slug: string): string | undefined {
  // Vercel'de değişkenler build'e gömülü geldiği için dinamik erişim
  // güvenli: process.env düz bir nesne, sunucuda çalışıyoruz.
  return process.env[passwordEnvName(slug)] || undefined
}

/** Şifre karşılaştırmasını girilen değerin uzunluğundan bağımsız tutar. */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  // Uzunluklar farklıysa bile tüm baytları gezip sonucu en sonda döndürüyoruz.
  let diff = bufA.length ^ bufB.length
  const max = Math.max(bufA.length, bufB.length)
  for (let i = 0; i < max; i++) {
    diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0)
  }
  return diff === 0
}

async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload),
  )
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Girilen şifrenin hangi menülere yetki verdiğini bulur. Eşleşme yoksa null.
 *
 * Tüm adayları geziyoruz, ilk eşleşmede çıkmıyoruz: erken çıkış, cevap
 * süresinden hangi şifrenin doğru olduğunu sızdırabilirdi.
 */
export function resolveScope(
  entered: string,
  slugs: string[],
): string | null {
  let scope: string | null = null

  const owner = ownerPassword()
  if (owner && timingSafeEqual(entered, owner)) scope = OWNER_SCOPE

  for (const slug of slugs) {
    const password = restaurantPassword(slug)
    if (!password) continue
    // Sahibin şifresi öncelikli; esnaf şifresi onu ezmesin.
    if (timingSafeEqual(entered, password) && scope !== OWNER_SCOPE) {
      scope = slug
    }
  }

  return scope
}

export type Session = { scope: string }

export async function createSession(scope: string): Promise<{
  value: string
  maxAge: number
}> {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  // Kapsam da imzanın içinde; yoksa çerezdeki slug elle değiştirilip
  // başkasının paneline geçilebilirdi.
  const payload = `${expiresAt}.${scope}`
  return {
    value: `${payload}.${await sign(payload)}`,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  }
}

/** Geçerliyse oturumu, değilse null döner. */
export async function readSession(
  cookieValue: string | undefined,
): Promise<Session | null> {
  if (!cookieValue) return null

  // Slug'lar nokta içermiyor, o yüzden üç parça bekliyoruz.
  const [expiresRaw, scope, signature] = cookieValue.split('.')
  if (!expiresRaw || !scope || !signature) return null

  const expiresAt = Number(expiresRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null

  try {
    const expected = await sign(`${expiresRaw}.${scope}`)
    return timingSafeEqual(expected, signature) ? { scope } : null
  } catch {
    // Secret tanımsızsa oturum doğrulanamaz; girişi reddet.
    return null
  }
}

/** Oturum bu menüyü düzenleyebilir mi? */
export function canEdit(session: Session | null, slug: string): boolean {
  if (!session) return false
  return session.scope === OWNER_SCOPE || session.scope === slug
}
