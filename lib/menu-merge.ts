import { cardKey, itemKey } from './menu-key'
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
              }
            }),
          }
        }

        return block
      }),
    })),
  }
}
