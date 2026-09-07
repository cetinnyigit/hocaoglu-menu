import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryNav } from '@/components/menu/CategoryNav'
import { MenuHero } from '@/components/menu/MenuHero'
import { MenuSection } from '@/components/menu/MenuSection'
import { getRestaurant, getRestaurantSlugs } from '@/lib/menu-data'

type Props = { params: { slug: string } }

/** Build sırasında her esnaf için statik HTML üretilir (SSG). */
export function generateStaticParams() {
  return getRestaurantSlugs().map((slug) => ({ slug }))
}

/** Listede olmayan bir slug istenirse 404 — rastgele sayfa üretilmesin. */
export const dynamicParams = false

export function generateMetadata({ params }: Props): Metadata {
  const restaurant = getRestaurant(params.slug)
  if (!restaurant) return {}

  return {
    title: restaurant.seo.title,
    description: restaurant.seo.description,
    openGraph: {
      title: restaurant.seo.title,
      description: restaurant.seo.description,
      images: [restaurant.hero.src],
      type: 'website',
    },
  }
}

export default function MenuPage({ params }: Props) {
  const restaurant = getRestaurant(params.slug)
  if (!restaurant) notFound()

  return (
    <>
      <MenuHero restaurant={restaurant} />
      <CategoryNav sections={restaurant.sections} />

      <div className="wrap">
        {restaurant.sections.map((section) => (
          <MenuSection section={section} key={section.id} />
        ))}
      </div>

      <div className="footer">
        {restaurant.footer.text}
        <br />
        <span className="vat">{restaurant.footer.vatNote}</span>
      </div>
    </>
  )
}
