import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MenuPageView } from '@/components/menu/MenuPageView'
import { getRestaurant, restaurants } from '@/lib/menu-data'
import {
  TRANSLATION_LANGS,
  isTranslationLang,
  translateRestaurant,
} from '@/lib/menu-i18n'
import { applyOverrides } from '@/lib/menu-merge'
import { menuMetadata } from '@/lib/menu-metadata'
import { readOverrides } from '@/lib/menu-store'

type Props = { params: { slug: string; dil: string } }

/**
 * Menünün Türkçe dışındaki dilleri. Türkçe /menu/<slug> kökünde kalıyor;
 * turist müşteri için açılan her dil kendi adresinde ayrı statik sayfa
 * oluyor — dil adreste durduğu için bağlantı paylaşılınca da korunuyor.
 */
export function generateStaticParams() {
  return restaurants.flatMap((restaurant) =>
    TRANSLATION_LANGS.filter((lang) => restaurant.translations?.[lang]).map(
      (lang) => ({ slug: restaurant.slug, dil: lang }),
    ),
  )
}

export const dynamicParams = true
export const revalidate = 3600

export function generateMetadata({ params }: Props): Metadata {
  if (!isTranslationLang(params.dil)) return {}
  return menuMetadata(params.slug, params.dil)
}

export default async function MenuLangPage({ params }: Props) {
  const base = getRestaurant(params.slug)
  // Çevirisi olmayan dil/esnaf ikilisi 404: yarım çevrilmiş bir sayfayı
  // Türkçe içerikle yayınlamaktansa yok saymak daha dürüst.
  if (!base || !isTranslationLang(params.dil) || !base.translations?.[params.dil]) {
    notFound()
  }

  // Sıra önemli: panel değerleri Türkçe anahtarlarla biniyor, çeviri
  // sonra geliyor. Panelden eklenen ürünlerin anahtarı çeviri tablosunda
  // bulunmadığı için onlar esnafın yazdığı adla kalır.
  const withPrices = applyOverrides(base, await readOverrides(params.slug))

  return (
    <MenuPageView
      restaurant={translateRestaurant(withPrices, params.dil)}
      lang={params.dil}
    />
  )
}
