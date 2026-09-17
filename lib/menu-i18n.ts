import { cardKey, itemKey, noteKey } from './menu-key'
import type {
  MenuLang,
  MenuTranslation,
  MenuTranslationLang,
  Restaurant,
} from './menu-data/types'

/**
 * Menünün dil desteği.
 *
 * Türkçe varsayılan ve /menu/<slug> adresinde durur; ek diller
 * /menu/<slug>/<dil> altında ayrı statik sayfa olarak üretilir. Dili adreste
 * tutmanın iki sebebi var: sayfa statik kalmaya devam ediyor (çeviri render
 * sırasında biniyor, tarayıcıya üç dilin verisi gitmiyor) ve turist müşteri
 * bağlantıyı paylaşınca karşı taraf da aynı dili görüyor.
 *
 * Fiyatlar çevrilmiyor: panelden girilen tek fiyat üç dilde de aynı.
 */

export const DEFAULT_LANG: MenuLang = 'tr'

/** Adres parçası olarak kabul edilen ek diller. */
export const TRANSLATION_LANGS: MenuTranslationLang[] = ['en', 'ar']

export function isTranslationLang(value: string): value is MenuTranslationLang {
  return (TRANSLATION_LANGS as string[]).includes(value)
}

/** Esnafın gerçekten çevirisi olan diller; sırası dil seçicideki sıradır. */
export function availableLangs(restaurant: Restaurant): MenuLang[] {
  const extra = TRANSLATION_LANGS.filter((lang) => restaurant.translations?.[lang])
  return [DEFAULT_LANG, ...extra]
}

/** Menünün o dildeki adresi. Türkçe kök adreste kalır. */
export function menuPath(slug: string, lang: MenuLang): string {
  return lang === DEFAULT_LANG ? `/menu/${slug}` : `/menu/${slug}/${lang}`
}

/** Dil seçicide görünen ad — her dil kendi yazısıyla yazılır. */
export const LANG_LABELS: Record<MenuLang, string> = {
  tr: 'Türkçe',
  en: 'English',
  ar: 'العربية',
}

/** Dar dil hapında görünen kısa etiket. */
export const LANG_SHORT: Record<MenuLang, string> = {
  tr: 'TR',
  en: 'EN',
  ar: 'عربي',
}

/** Arapça sağdan sola; sayfanın dir'i buradan geliyor. */
export function langDir(lang: MenuLang): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Menünün kendisinden gelmeyen, arayüzde sabit duran metinler. Menü verisi
 * esnafa ait; burası bileşenlerin metni.
 */
export type MenuStrings = {
  soldOut: string
  close: string
  language: string
  contactTitle: string
  address: string
  phone: string
  instagram: string
  hours: string
  openInMaps: string
  calories: string
}

export const MENU_STRINGS: Record<MenuLang, MenuStrings> = {
  tr: {
    soldOut: 'Tükendi',
    close: 'Kapat',
    language: 'Dil',
    contactTitle: 'İletişim',
    address: 'Adres',
    phone: 'Telefon',
    instagram: 'Instagram',
    hours: 'Saatler',
    openInMaps: 'Google Haritalar’da aç',
    calories: 'kcal',
  },
  en: {
    soldOut: 'Sold out',
    close: 'Close',
    language: 'Language',
    contactTitle: 'Contact',
    address: 'Address',
    phone: 'Phone',
    instagram: 'Instagram',
    hours: 'Hours',
    openInMaps: 'Open in Google Maps',
    calories: 'kcal',
  },
  ar: {
    soldOut: 'نفدت الكمية',
    close: 'إغلاق',
    language: 'اللغة',
    contactTitle: 'معلومات التواصل',
    address: 'العنوان',
    phone: 'الهاتف',
    instagram: 'إنستغرام',
    hours: 'ساعات العمل',
    openInMaps: 'افتح في خرائط جوجل',
    calories: 'سعرة حرارية',
  },
}

export function menuStrings(lang: MenuLang): MenuStrings {
  return MENU_STRINGS[lang] ?? MENU_STRINGS[DEFAULT_LANG]
}

/**
 * Menüyü istenen dile çevirir. Çevirisi olmayan her alan Türkçesiyle kalır,
 * yani eksik çeviri sayfayı boş bırakmaz.
 *
 * Panelden eklenen ürünlerin anahtarı `ek-...` biçiminde ve çeviri
 * tablosunda karşılığı yok; o ürünler her dilde esnafın yazdığı adla
 * görünür. Bilinçli: esnaf ürünü panelden eklerken üç dil birden yazamaz.
 */
export function translateRestaurant(
  restaurant: Restaurant,
  lang: MenuLang,
): Restaurant {
  if (lang === DEFAULT_LANG) return restaurant

  // lang burada artık 'tr' olamaz ama TypeScript bunu birleşim tipinden
  // çıkaramıyor; daraltma elle yapılıyor.
  const t: MenuTranslation | undefined =
    restaurant.translations?.[lang as MenuTranslationLang]
  if (!t) return restaurant

  const itemText = (key: string) => t.items?.[key]

  return {
    ...restaurant,
    tagline: t.tagline ?? restaurant.tagline,
    seo: t.seo ?? restaurant.seo,
    contact: restaurant.contact
      ? {
          ...restaurant.contact,
          address: t.contact?.address ?? restaurant.contact.address,
          hours: t.contact?.hours ?? restaurant.contact.hours,
        }
      : undefined,
    footer: {
      text: t.footer?.text ?? restaurant.footer.text,
      vatNote: t.footer?.vatNote ?? restaurant.footer.vatNote,
    },
    sections: restaurant.sections.map((section) => {
      const st = t.sections?.[section.id]

      return {
        ...section,
        heading: st?.heading ?? section.heading,
        navLabel: st?.navLabel ?? section.navLabel,
        blocks: section.blocks.map((block) => {
          if (block.kind === 'note') {
            const tr = itemText(noteKey(section.id, block.title))
            return tr
              ? { ...block, title: tr.name ?? block.title, body: tr.desc ?? block.body }
              : block
          }

          if (block.kind === 'cards') {
            return {
              ...block,
              cards: block.cards.map((card) => {
                const tr = itemText(card.key ?? cardKey(section.id, card.name))
                if (!tr) return card
                return {
                  ...card,
                  name: tr.name ?? card.name,
                  desc: tr.desc ?? card.desc,
                  size: tr.size ?? card.size,
                  // alt metni ada bağlı; ad çevrilince o da çevrilmeli.
                  image: card.image
                    ? { ...card.image, alt: tr.name ?? card.image.alt }
                    : undefined,
                }
              }),
            }
          }

          if (block.kind === 'group') {
            return {
              ...block,
              items: block.items.map((item) => {
                const tr = itemText(
                  item.key ?? itemKey(section.id, block.title, item.name),
                )
                if (!tr) return item
                return {
                  ...item,
                  name: tr.name ?? item.name,
                  desc: tr.desc ?? item.desc,
                  size: tr.size ?? item.size,
                  image: item.image
                    ? { ...item.image, alt: tr.name ?? item.image.alt }
                    : undefined,
                }
              }),
            }
          }

          return block
        }),
      }
    }),
  }
}
