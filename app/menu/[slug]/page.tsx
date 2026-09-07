import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryNav } from '@/components/menu/CategoryNav'
import { MenuHero } from '@/components/menu/MenuHero'
import { MenuSection } from '@/components/menu/MenuSection'
import { getRestaurant, getRestaurantSlugs } from '@/lib/menu-data'
import { applyOverrides } from '@/lib/menu-merge'
import { readOverrides } from '@/lib/menu-store'

type Props = { params: { slug: string } }

/** Build sırasında her esnaf için statik HTML üretilir (SSG). */
export function generateStaticParams() {
  return getRestaurantSlugs().map((slug) => ({ slug }))
}

/**
 * dynamicParams bilerek açık (varsayılan). Kapalıyken revalidatePath sonrası
 * sayfa geçersiz kılınıyor ama yeniden üretilemiyor ve 404 dönüyordu.
 * Tanımsız slug'lar zaten aşağıdaki notFound() ile 404 oluyor.
 */
export const dynamicParams = true

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

export default async function MenuPage({ params }: Props) {
  const base = getRestaurant(params.slug)
  if (!base) notFound()

  // Panelden kaydedilen fiyat/tükendi bilgisi koddaki menünün üzerine biner.
  // Okuma önbellekli olduğu için sayfa statik kalmaya devam eder.
  const restaurant = applyOverrides(base, await readOverrides(params.slug))

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
