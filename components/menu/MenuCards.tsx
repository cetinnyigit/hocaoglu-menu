'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import { formatPrice } from '@/lib/format-price'
import type { MenuCard } from '@/lib/menu-data/types'
import { ItemDetailDialog } from './ItemDetailDialog'

/** Karttaki küçük kare görsel. CSS'teki .kahvalti-thumb ile aynı olmalı. */
const THUMB_SIZE = 62

/**
 * Kartın açıklaması zaten tamamen görünüyor; dokunmanın bir şey katması için
 * fotoğraf ya da kalori gerekiyor.
 */
function hasDetail(card: MenuCard): boolean {
  return Boolean(card.image || card.calories)
}

/**
 * Kahvaltı tabakları. Sağ tarafta diğer ürün satırlarıyla aynı gösterim
 * kullanılır: fiyat varsa fiyat, yoksa renkli çubuk placeholder.
 *
 * Fotoğrafı olan tabak ürün satırlarıyla aynı şekilde davranır: küçük resim
 * kartta görünür, dokununca büyük görselli detay kartı açılır.
 */
export function MenuCards({ cards }: { cards: MenuCard[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex === null ? null : cards[openIndex]

  const close = useCallback(() => setOpenIndex(null), [])

  return (
    <>
      <div className="kahvalti-grid">
        {cards.map((card, i) => {
          const body = (
            <>
              <div className="kahvalti-card-main">
                {card.image ? (
                  <Image
                    className="kahvalti-thumb"
                    src={card.image.src}
                    alt=""
                    width={THUMB_SIZE}
                    height={THUMB_SIZE}
                    sizes={`${THUMB_SIZE}px`}
                    loading="lazy"
                  />
                ) : null}

                <div>
                  <span className="name">{card.name}</span>
                  <p className="kahvalti-desc">{card.desc}</p>
                </div>
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
            </>
          )

          const className = card.soldOut
            ? 'kahvalti-card is-soldout'
            : 'kahvalti-card'

          if (!hasDetail(card)) {
            return (
              <div className={className} key={card.name}>
                {body}
              </div>
            )
          }

          return (
            <button
              type="button"
              className={`${className} is-clickable`}
              key={card.name}
              onClick={() => setOpenIndex(i)}
              aria-haspopup="dialog"
            >
              {body}
            </button>
          )
        })}
      </div>

      {open ? <ItemDetailDialog item={open} onClose={close} /> : null}
    </>
  )
}
