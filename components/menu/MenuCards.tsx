import { formatPrice } from '@/lib/format-price'
import type { MenuCard } from '@/lib/menu-data/types'

/**
 * Kahvaltı tabakları. Sağ tarafta diğer ürün satırlarıyla aynı gösterim
 * kullanılır: fiyat varsa fiyat, yoksa renkli çubuk placeholder.
 */
export function MenuCards({ cards }: { cards: MenuCard[] }) {
  return (
    <div className="kahvalti-grid">
      {cards.map((card) => (
        <div
          className={card.soldOut ? 'kahvalti-card is-soldout' : 'kahvalti-card'}
          key={card.name}
        >
          <div>
            <span className="name">{card.name}</span>
            <p className="kahvalti-desc">{card.desc}</p>
          </div>

          {card.soldOut ? (
            <span className="item-soldout">Tükendi</span>
          ) : card.price ? (
            <span className="item-price">{formatPrice(card.price)}</span>
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
