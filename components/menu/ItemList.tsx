'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format-price'
import type { MenuItem } from '@/lib/menu-data/types'

/** Detay kartında görsel bu genişlikte basılıyor (kart iç genişliği). */
const DETAIL_WIDTH = 520
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
 * Detay bilgisi (görsel/içerik/gramaj/kalori) olan ürünler tıklanabilir:
 * satır bir butona dönüşür ve büyük görselli bir kart açar. Detayı olmayan
 * ürünler eskisi gibi düz satır kalır — boş kart açan tıklama hedefi olmaz.
 */
export function ItemList({ items }: { items: MenuItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = openIndex === null ? null : items[openIndex]

  const close = useCallback(() => setOpenIndex(null), [])

  // Kart açıkken Escape kapatsın ve arkadaki menü kaymasın.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

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

      {open ? (
        <div
          className="item-detail-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          onClick={close}
        >
          {/* Kartın içine yapılan tıklama kartı kapatmasın. */}
          <div className="item-detail" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="item-detail-close"
              onClick={close}
              aria-label="Kapat"
            >
              ✕
            </button>

            {open.image ? (
              <div className="item-detail-photo">
                <Image
                  src={open.image.src}
                  alt={open.image.alt}
                  width={open.image.width}
                  height={open.image.height}
                  sizes={`(max-width: ${DETAIL_WIDTH}px) 100vw, ${DETAIL_WIDTH}px`}
                  priority
                />
              </div>
            ) : null}

            <div className="item-detail-body">
              <div className="item-detail-head">
                <h3 className="item-detail-name">{open.name}</h3>
                {open.soldOut ? (
                  <span className="item-soldout">Tükendi</span>
                ) : open.price ? (
                  <span className="item-price">{formatPrice(open.price)}</span>
                ) : null}
              </div>

              {open.size || open.calories ? (
                <div className="item-detail-meta">
                  {open.size ? <span>{open.size}</span> : null}
                  {open.calories ? <span>{open.calories} kcal</span> : null}
                </div>
              ) : null}

              {open.desc ? <p className="item-detail-desc">{open.desc}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
