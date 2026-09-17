import type { Metadata } from 'next'
import { restaurantUrl } from './domains'
import { getRestaurant } from './menu-data'
import type { MenuLang } from './menu-data/types'
import {
  DEFAULT_LANG,
  availableLangs,
  translateRestaurant,
} from './menu-i18n'

/**
 * Menünün o dildeki herkese açık adresi.
 *
 * Türkçe kökte durur; ek diller bir alt yol olur. Kendi alan adı olan
 * esnafta bu `https://alanadi.com/en` demek — middleware o yolu menünün
 * dil sayfasına çeviriyor.
 */
export function menuUrl(slug: string, lang: MenuLang): string {
  const base = restaurantUrl(slug)
  return lang === DEFAULT_LANG ? base : `${base}/${lang}`
}

/**
 * Menü sayfasının metadata'sı. İki route (Türkçe kök ve /<dil>) aynı yerden
 * besleniyor; diller birbirinin alternatifi olarak bildiriliyor ki arama
 * motoru aynı menüyü ayrı sayfalar sanmasın, turist müşteriye de kendi
 * dilindekini göstersin.
 */
export function menuMetadata(slug: string, lang: MenuLang): Metadata {
  const base = getRestaurant(slug)
  if (!base) return {}

  const restaurant = translateRestaurant(base, lang)
  const url = menuUrl(slug, lang)

  const languages: Record<string, string> = {}
  for (const other of availableLangs(base)) {
    languages[other] = menuUrl(slug, other)
  }

  return {
    title: restaurant.seo.title,
    description: restaurant.seo.description,
    alternates: {
      canonical: url,
      // Tek dilli menüde bu tablo yalnızca Türkçeyi içerir; zararsız.
      languages,
    },
    openGraph: {
      title: restaurant.seo.title,
      description: restaurant.seo.description,
      url,
      images: [new URL(restaurant.hero.src, url).toString()],
      locale: lang,
      type: 'website',
    },
  }
}
