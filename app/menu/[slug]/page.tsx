import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MenuPageView } from '@/components/menu/MenuPageView'
import { getRestaurant, getRestaurantSlugs } from '@/lib/menu-data'
import { DEFAULT_LANG } from '@/lib/menu-i18n'
import { applyOverrides } from '@/lib/menu-merge'
import { menuMetadata } from '@/lib/menu-metadata'
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

/**
 * Güvenlik ağı. Asıl güncelleme panelden kaydedince anında oluyor
 * (revalidateTag + revalidatePath). Ama OIDC kimlik doğrulaması build
 * sırasında kullanılamazsa fiyatlar o build'de okunamaz ve sayfa fiyatsız
 * üretilir; bu sayede en geç bir saat içinde kendini toparlar.
 *
 * Ziyaretçi yine CDN'den anında cevap alır (stale-while-revalidate).
 */
export const revalidate = 3600

export function generateMetadata({ params }: Props): Metadata {
  return menuMetadata(params.slug, DEFAULT_LANG)
}

export default async function MenuPage({ params }: Props) {
  const base = getRestaurant(params.slug)
  if (!base) notFound()

  // Panelden kaydedilen fiyat/tükendi bilgisi koddaki menünün üzerine biner.
  // Okuma önbellekli olduğu için sayfa statik kalmaya devam eder.
  const restaurant = applyOverrides(base, await readOverrides(params.slug))

  return <MenuPageView restaurant={restaurant} lang={DEFAULT_LANG} />
}
