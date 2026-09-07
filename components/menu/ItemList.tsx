import { formatPrice } from '@/lib/format-price'
import type { MenuItem } from '@/lib/menu-data/types'

/**
 * Fiyatı girilmiş ürünlerde fiyat, boş olanlarda orijinal tasarımdaki
 * renkli çubuk placeholder'ı gösterilir.
 */
export function ItemList({ items }: { items: MenuItem[] }) {
  return (
    <div className="item-list">
      {items.map((item, i) => (
        <div
          className={item.soldOut ? 'item-row is-soldout' : 'item-row'}
          key={`${item.name}-${i}`}
        >
          <span className="item-name">{item.name}</span>
          {item.soldOut ? (
            <span className="item-soldout">Tükendi</span>
          ) : item.price ? (
            <span className="item-price">{formatPrice(item.price)}</span>
          ) : (
            <span className="item-bars" aria-hidden="true">
              <span className="b1" />
              <span className="b2" />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
