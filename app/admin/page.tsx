import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logout } from './actions'
import { OWNER_SCOPE, SESSION_COOKIE, readSession } from '@/lib/auth'
import { restaurants } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Menü Paneli',
  robots: { index: false, follow: false },
}

/** Oturumun kapsamına göre değişiyor; önbelleğe alınmamalı. */
export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const session = await readSession(cookies().get(SESSION_COOKIE)?.value)
  if (!session) redirect('/admin/giris')

  // Esnaf kendi menüsünden başkasını göremez; araya liste koymanın anlamı yok.
  if (session.scope !== OWNER_SCOPE) redirect(`/admin/${session.scope}`)

  // Sahip girişi ama tek esnaf varsa da liste gereksiz.
  if (restaurants.length === 1) redirect(`/admin/${restaurants[0].slug}`)

  return (
    <div className="admin-shell admin-shell-narrow">
      <div className="admin-card">
        <h1 className="admin-title">Menü Paneli</h1>
        <p className="admin-subtitle">Düzenlemek istediğin menüyü seç.</p>
        <ul className="admin-list">
          {restaurants.map((restaurant) => (
            <li key={restaurant.slug}>
              <Link href={`/admin/${restaurant.slug}`}>{restaurant.name}</Link>
            </li>
          ))}
        </ul>
        <form action={logout}>
          <button className="admin-link admin-link-button" type="submit">
            Çıkış
          </button>
        </form>
      </div>
    </div>
  )
}
