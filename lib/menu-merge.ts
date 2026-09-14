import { blockGroupId, cardKey, itemKey, noteKey } from './menu-key'
import type { AddedItem, MenuOverrides, Restaurant } from './menu-data/types'

/**
 * Panelden eklenen ürünleri hedef gruplarının sonuna yerleştirir.
 *
 * Fiyat/içerik/fotoğraf burada işlenmiyor: eklenen ürün de menüye girdikten
 * sonra diğerleriyle aynı yoldan, items[key] üzerinden bindiriliyor. Bu
 * yüzden önce ekleme, sonra override sırası önemli.
 */
function withAddedItems(
  restaurant: Restaurant,
  added: AddedItem[],
): Restaurant {
  // Alan sonradan geldi: hem eski JSON kayıtlarında hem de önceki
  // deploy'dan kalan önbellek girdilerinde yok. Menü sayfası bunun için
  // çökmemeli.
  if (!added || added.length === 0) return restaurant

  return {
    ...restaurant,
    sections: restaurant.sections.map((section) => {
      const mine = added.filter((entry) => entry.section === section.id)
      if (mine.length === 0) return section

      /**
       * Hedef grubu bulamayanlar bölümün ilk ürün grubuna düşer. Menü
       * verisinde grup başlığı değişirse ürün yanlış grupta görünür ama
       * kaybolmaz — esnaf panelde görüp taşıyabilir. Bölümün hiç ürün grubu
       * yoksa (-1) ürün basılmaz; panel onu "yeri bulunamadı" diye listeler.
       */
      const fallback = section.blocks.findIndex((b) => b.kind === 'group')
      const targetOf = (entry: AddedItem) => {
        const index = section.blocks.findIndex(
          (b) => blockGroupId(b) === entry.group,
        )
        return index === -1 ? fallback : index
      }

      return {
        ...section,
        blocks: section.blocks.map((block, index) => {
          const incoming = mine.filter((entry) => targetOf(entry) === index)
          if (incoming.length === 0) return block

          if (block.kind === 'cards') {
            return {
              ...block,
              cards: [
                ...block.cards,
                // desc kartlarda zorunlu; panelden doldurulana kadar boş.
                ...incoming.map((e) => ({ key: e.key, name: e.name, desc: '' })),
              ],
            }
          }

          if (block.kind === 'group') {
            return {
              ...block,
              items: [
                ...block.items,
                ...incoming.map((e) => ({ key: e.key, name: e.name })),
              ],
            }
          }

          return block
        }),
      }
    }),
  }
}

/**
 * Koddaki menünün üzerine panelden kaydedilen her şeyi bindirir: önce
 * eklenen ürünler yerleşir, sonra fiyat/tükendi/içerik/fotoğraf işlenir.
 * Kaynak veri değiştirilmez, yeni bir nesne döner.
 */
export function applyOverrides(
  restaurant: Restaurant,
  overrides: MenuOverrides,
): Restaurant {
  const base = withAddedItems(restaurant, overrides.added)

  return {
    ...base,
    sections: base.sections.map((section) => ({
      ...section,
      blocks: section.blocks.map((block) => {
        if (block.kind === 'note') {
          const override = overrides.items[noteKey(section.id, block.title)]
          if (!override) return block
          return {
            ...block,
            price: override.price ?? block.price,
            soldOut: override.soldOut ?? block.soldOut,
          }
        }

        if (block.kind === 'cards') {
          return {
            ...block,
            cards: block.cards.map((card) => {
              const override =
                overrides.items[card.key ?? cardKey(section.id, card.name)]
              if (!override) return card
              return {
                ...card,
                price: override.price ?? card.price,
                soldOut: override.soldOut ?? card.soldOut,
                desc: override.desc ?? card.desc,
                calories: override.calories ?? card.calories,
                image: override.image
                  ? { ...override.image, alt: card.name }
                  : card.image,
              }
            }),
          }
        }

        if (block.kind === 'group') {
          return {
            ...block,
            items: block.items.map((item) => {
              const override =
                overrides.items[
                  item.key ?? itemKey(section.id, block.title, item.name)
                ]
              if (!override) return item
              return {
                ...item,
                price: override.price ?? item.price,
                soldOut: override.soldOut ?? item.soldOut,
                desc: override.desc ?? item.desc,
                calories: override.calories ?? item.calories,
                // alt metni burada üretiliyor: panel yalnızca dosyayı ve
                // ölçüsünü biliyor, ürünün adını bu birleştirme biliyor.
                image: override.image
                  ? { ...override.image, alt: item.name }
                  : item.image,
              }
            }),
          }
        }

        return block
      }),
    })),
  }
}
