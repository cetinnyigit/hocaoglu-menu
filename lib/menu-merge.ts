import { cardKey, itemKey, noteKey } from './menu-key'
import type { MenuOverrides, Restaurant } from './menu-data/types'

/**
 * Koddaki menünün üzerine panelden kaydedilen fiyat/tükendi bilgisini
 * bindirir. Kaynak veri değiştirilmez, yeni bir nesne döner.
 */
export function applyOverrides(
  restaurant: Restaurant,
  overrides: MenuOverrides,
): Restaurant {
  return {
    ...restaurant,
    sections: restaurant.sections.map((section) => ({
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
              const override = overrides.items[cardKey(section.id, card.name)]
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
                overrides.items[itemKey(section.id, block.title, item.name)]
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
