import Link from 'next/link'
import { restaurants } from '@/lib/menu-data'

export default function Home() {
  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <h1 className="plain-heading ink">Menüler</h1>
      <div className="item-list">
        {restaurants.map((restaurant) => (
          <Link
            href={`/menu/${restaurant.slug}`}
            key={restaurant.slug}
            className="item-row"
            style={{ textDecoration: 'none' }}
          >
            <span className="item-name">
              {restaurant.name} — {restaurant.tagline}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
