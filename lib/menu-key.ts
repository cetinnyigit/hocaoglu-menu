import type { MenuBlock, Restaurant } from './menu-data/types'

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
export const DEFAULT_GROUP = 'main'

/** Kahvaltı tabağı bloklarının grup kimliği. */
export const CARDS_GROUP = 'cards'

/**
 * Bloğun AddedItem.group karşılığı. Panelden eklenen ürün bu kimlikle
 * hedefini buluyor — blok sırası değişse de doğru gruba düşsün diye
 * indeks değil, başlıktan türeyen sabit bir ad kullanılıyor.
 *
 * Ürün eklenemeyen bloklar (fotoğraf, fiyatlı not) null döner.
 */
export function blockGroupId(block: MenuBlock): string | null {
  if (block.kind === 'cards') return CARDS_GROUP
  if (block.kind === 'group') {
    return block.title ? slugify(block.title) : DEFAULT_GROUP
  }
  return null
}

/**
 * Panelden eklenen ürün için anahtar üretir.
 *
 * Türetilen anahtarlarda hep iki nokta üst üste var (bolum:grup:ad); burada
 * hiç yok, o yüzden koddaki hiçbir ürünle çakışamaz. Addan bağımsız olması
 * da bilinçli: esnaf ürünün adını sonradan düzeltince fiyatı kaybolmasın.
 */
export function newItemKey(): string {
  return `ek-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
}

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

/** Not bloğunun kendisi de fiyatlanabilir (ör. "Premium Kahvaltı"). */
export function noteKey(sectionId: string, noteTitle: string): string {
  return `${sectionId}:note:${slugify(noteTitle)}`
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
      if (block.kind === 'note') {
        entries.push({
          key: noteKey(section.id, block.title),
          name: block.title,
          sectionId: section.id,
          sectionLabel: section.navLabel,
          price: block.price ?? '',
          soldOut: block.soldOut ?? false,
        })
      } else if (block.kind === 'cards') {
        for (const card of block.cards) {
          entries.push({
            // Panelden eklenen tabakta anahtar hazır gelir; koddakinde türer.
            key: card.key ?? cardKey(section.id, card.name),
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
            key: item.key ?? itemKey(section.id, block.title, item.name),
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
