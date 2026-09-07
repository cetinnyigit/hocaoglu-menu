import Image from 'next/image'
import type { Restaurant } from '@/lib/menu-data/types'

export function MenuHero({ restaurant }: { restaurant: Restaurant }) {
  const { hero, name, established, tagline } = restaurant

  return (
    <div className="hero">
      <Image
        src={hero.src}
        alt={hero.alt}
        fill
        // Ekranda tam genişlik kaplıyor; LCP öğesi olduğu için preload edilir.
        sizes="100vw"
        priority
        style={{ objectFit: 'cover' }}
      />
      <div className="hero-content">
        <p className="brand-est">{established}</p>
        <h1 className="brand-name">{name}</h1>
        <p className="brand-sub">{tagline}</p>
      </div>
    </div>
  )
}
