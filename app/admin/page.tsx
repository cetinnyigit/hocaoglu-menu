import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { restaurants } from '@/lib/menu-data'

export const metadata: Metadata = {
  title: 'Menü Paneli',
  robots: { index: false, follow: false },
}

export default function AdminHome() {
  // Tek esnaf varken araya bir liste sayfası koymanın anlamı yok.
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
      </div>
    </div>
  )
}
