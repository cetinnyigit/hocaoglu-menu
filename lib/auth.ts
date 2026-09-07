/**
 * Panel girişi: tek ortak şifre + imzalı çerez.
 *
 * Kullanıcı hesabı yok — şifre ortam değişkeninde durur, giriş yapılınca
 * HMAC ile imzalanmış bir oturum çerezi bırakılır. İmzalama Web Crypto ile
 * yapılıyor ki hem Node hem de middleware'in Edge ortamında çalışsın.
 */

export const SESSION_COOKIE = 'menu_admin'
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 saat

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

export function adminPassword(): string {
  const value = process.env.ADMIN_PASSWORD
  if (!value) {
    throw new Error(
      'ADMIN_PASSWORD tanımlı değil. Vercel proje ayarlarından ekle.',
    )
  }
  return value
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

export async function createSession(): Promise<{
  value: string
  maxAge: number
}> {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payload = String(expiresAt)
  return {
    value: `${payload}.${await sign(payload)}`,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  }
}

export async function isValidSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  if (!cookieValue) return false

  const [payload, signature] = cookieValue.split('.')
  if (!payload || !signature) return false

  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  try {
    return timingSafeEqual(await sign(payload), signature)
  } catch {
    // Secret tanımsızsa oturum doğrulanamaz; girişi reddet.
    return false
  }
}
