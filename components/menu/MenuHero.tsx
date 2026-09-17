import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Restaurant } from '@/lib/menu-data/types'

/**
 * children: hero'nun üst köşesine basılan ek öğe (dil seçici). Menüde dil
 * desteği yoksa hiç gelmez, hero eskisi gibi görünür.
 */
export function MenuHero({
  restaurant,
  children,
}: {
  restaurant: Restaurant
  children?: ReactNode
}) {
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
      {children}

      <div className="hero-content">
        {established ? <p className="brand-est">{established}</p> : null}
        <h1 className="brand-name">{name}</h1>
        <p className="brand-sub">{tagline}</p>
      </div>
    </div>
  )
}
