import type { Restaurant } from './menu-data/types'

/**
 * Kaydedilen fiyatların hangi ürüne ait olduğunu bulmak için kalıcı anahtar
 * üretir. Anahtar bölüm + grup başlığı + ürün adından türetilir; ürünlerin
 * sırası değişse de anahtar sabit kalır.
 *
 * Sadece ürün adı yeterli değil — "Peynirli", "Kaşarlı" gibi adlar birden
 * fazla bölümde geçiyor ve fiyatları birbirine karışırdı.
 */

const TR_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  Ç: 'c',
  Ğ: 'g',
  İ: 'i',
  I: 'i',
  Ö: 'o',
  Ş: 's',
  Ü: 'u',
}

export function slugify(value: string): string {
  return value
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Başlıksız gruplar için sabit ad. */
const DEFAULT_GROUP = 'main'

export function itemKey(
  sectionId: string,
  groupTitle: string | undefined,
  itemName: string,
): string {
  return `${sectionId}:${groupTitle ? slugify(groupTitle) : DEFAULT_GROUP}:${slugify(itemName)}`
}

export function cardKey(sectionId: string, cardName: string): string {
  return `${sectionId}:cards:${slugify(cardName)}`
}

/**
 * Menüdeki her düzenlenebilir alanı anahtarıyla birlikte düz bir liste
 * hâlinde döndürür. Hem panel formu hem de anahtar çakışması kontrolü
 * bunu kullanır.
 */
export type EditableEntry = {
  key: string
  name: string
  sectionId: string
  sectionLabel: string
  groupLabel?: string
  price: string
  soldOut: boolean
}

export function collectEditableEntries(
  restaurant: Restaurant,
): EditableEntry[] {
  const entries: EditableEntry[] = []

  for (const section of restaurant.sections) {
    for (const block of section.blocks) {
      if (block.kind === 'cards') {
        for (const card of block.cards) {
          entries.push({
            key: cardKey(section.id, card.name),
            name: card.name,
            sectionId: section.id,
            sectionLabel: section.navLabel,
            price: card.price ?? '',
            soldOut: card.soldOut ?? false,
          })
        }
      } else if (block.kind === 'group') {
        for (const item of block.items) {
          entries.push({
            key: itemKey(section.id, block.title, item.name),
            name: item.name,
            sectionId: section.id,
            sectionLabel: section.navLabel,
            groupLabel: block.title,
            price: item.price ?? '',
            soldOut: item.soldOut ?? false,
          })
        }
      }
    }
  }

  return entries
}

/**
 * İki ürün aynı anahtarı üretiyorsa fiyatları birbirine karışır. Bu sessizce
 * olmasın diye menü verisi değiştiğinde patlaması gereken bir kontrol.
 */
export function findDuplicateKeys(restaurant: Restaurant): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const entry of collectEditableEntries(restaurant)) {
    if (seen.has(entry.key)) duplicates.add(entry.key)
    seen.add(entry.key)
  }

  return Array.from(duplicates)
}
