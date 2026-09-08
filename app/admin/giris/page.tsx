import type { Metadata } from 'next'
import { login } from '../actions'
import { ownerPassword, restaurantPassword } from '@/lib/auth'
import { getRestaurantSlugs } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Panel Girişi',
  robots: { index: false, follow: false },
}

/** Ortam değişkenleri build'de değil, istek anında okunmalı. */
export const dynamic = 'force-dynamic'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { hata?: string; devam?: string }
}) {
  // Ortam değişkenleri eksikse giriş denemesi 500 ile patlardı; sebebi
  // baştan söylemek deploy sonrası hata ayıklamayı kısaltıyor.
  // Hiç şifre tanımlı değilse kimse giremez — ne sahip ne de esnaf.
  const anyPassword =
    Boolean(ownerPassword()) ||
    getRestaurantSlugs().some((slug) => Boolean(restaurantPassword(slug)))

  const missing = [
    anyPassword ? null : 'ADMIN_PASSWORD veya ADMIN_PASSWORD_<SLUG>',
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 16
      ? null
      : 'ADMIN_SESSION_SECRET',
  ].filter(Boolean)

  if (missing.length > 0) {
    return (
      <div className="admin-shell admin-shell-narrow">
        <div className="admin-card">
          <h1 className="admin-title">Panel kurulmamış</h1>
          <p className="admin-subtitle">
            Şu ortam değişkenleri eksik veya geçersiz: {missing.join(', ')}.
            Vercel proje ayarlarından ekleyip yeniden deploy et.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell admin-shell-narrow">
      <form action={login} className="admin-card admin-login">
        <h1 className="admin-title">Menü Paneli</h1>
        <p className="admin-subtitle">Devam etmek için şifreyi gir.</p>

        {searchParams.hata ? (
          <p className="admin-error" role="alert">
            Şifre hatalı.
          </p>
        ) : null}

        <input type="hidden" name="devam" value={searchParams.devam ?? ''} />

        <label className="admin-label" htmlFor="sifre">
          Şifre
        </label>
        <input
          className="admin-input"
          id="sifre"
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
        />

        <button className="admin-button" type="submit">
          Giriş yap
        </button>
      </form>
    </div>
  )
}
