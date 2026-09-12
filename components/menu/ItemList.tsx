'use client'

import Image from 'next/image'
import { useCallback, useState } from 'react'
import { formatPrice } from '@/lib/format-price'
import type { MenuItem } from '@/lib/menu-data/types'
import { ItemDetailDialog } from './ItemDetailDialog'

/** Satırdaki küçük kare görsel. CSS'teki .item-thumb ile aynı olmalı. */
const THUMB_SIZE = 52

/**
 * Görsel, içerik veya kalori — biri varsa satır tıklanabilir. Ölçü tek
 * başına yetmiyor: zaten satırda görünüyor, sadece onu tekrar eden bir kart
 * açmak tıklamayı boşa çıkarırdı.
 */
function hasDetail(item: MenuItem): boolean {
  return Boolean(item.image || item.desc || item.calories)
}

/**
 * Fiyatı girilmiş ürünlerde fiyat, boş olanlarda orijinal tasarımdaki
 * renkli çubuk placeholder'ı gösterilir.
 *
 * Detay bilgisi (görsel/içerik/kalori) olan ürünler tıklanabilir: satır bir
 * butona dönüşür ve büyük görselli bir kart açar. Detayı olmayan ürünler
 * eskisi gibi düz satır kalır — boş kart açan tıklama hedefi olmaz.
 */
export function ItemList({ items }: { items: MenuItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex === null ? null : items[openIndex]

  const close = useCallback(() => setOpenIndex(null), [])

  return (
    <>
      <div className="item-list">
        {items.map((item, i) => {
          const right = item.soldOut ? (
            <span className="item-soldout">Tükendi</span>
          ) : item.price ? (
            <span className="item-price">{formatPrice(item.price)}</span>
          ) : (
            <span className="item-bars" aria-hidden="true">
              <span className="b1" />
              <span className="b2" />
            </span>
          )

          const label = (
            <span className="item-main">
              {item.image ? (
                <Image
                  className="item-thumb"
                  src={item.image.src}
                  alt=""
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  sizes={`${THUMB_SIZE}px`}
                  loading="lazy"
                />
              ) : null}

              <span className="item-text">
                <span className="item-name">{item.name}</span>
                {item.size ? <span className="item-size">{item.size}</span> : null}
              </span>
            </span>
          )

          const className = item.soldOut ? 'item-row is-soldout' : 'item-row'
          const key = `${item.name}-${i}`

          if (!hasDetail(item)) {
            return (
              <div className={className} key={key}>
                {label}
                {right}
              </div>
            )
          }

          return (
            <button
              type="button"
              className={`${className} is-clickable`}
              key={key}
              onClick={() => setOpenIndex(i)}
              aria-haspopup="dialog"
            >
              {label}
              {right}
            </button>
          )
        })}
      </div>

      {open ? <ItemDetailDialog item={open} onClose={close} /> : null}
    </>
  )
}
