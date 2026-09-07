import type { BadgeTone, MenuCard } from '@/lib/menu-data/types'

const badgeClass: Record<BadgeTone, string> = {
  gold: 'badge-gold-tier',
  klasik: 'badge-klasik',
  mini: 'badge-mini',
}

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
          <div className="card-meta">
            <span className={`badge ${badgeClass[card.badge.tone]}`}>
              {card.badge.label}
            </span>
            {card.soldOut ? (
              <span className="item-soldout">Tükendi</span>
            ) : card.price ? (
              <span className="card-price">{card.price}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
