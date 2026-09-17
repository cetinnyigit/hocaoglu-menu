'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { formatPrice } from '@/lib/format-price'
import type { MenuItemDetail, MenuLang } from '@/lib/menu-data/types'
import { DEFAULT_LANG, menuStrings } from '@/lib/menu-i18n'

/** Detay kartında görsel bu genişlikte basılıyor (kart iç genişliği). */
const DETAIL_WIDTH = 520

/**
 * Kartın gösterdiği alanlar. Hem ürün satırları hem de kahvaltı tabakları
 * aynı kartı kullanıyor — müşteri için ikisi de "ürüne dokun, büyüsün".
 */
export type DetailItem = MenuItemDetail & {
  name: string
  price?: string
  soldOut?: boolean
}

/**
 * Ürüne dokununca açılan büyük görselli kart: fotoğraf, ad, fiyat,
 * gramaj/ml, kalori ve içindekiler.
 *
 * Kapanma yolları: kart dışına dokunma, ✕ ve Escape.
 */
export function ItemDetailDialog({
  item,
  onClose,
  lang = DEFAULT_LANG,
}: {
  item: DetailItem
  onClose: () => void
  lang?: MenuLang
}) {
  const strings = menuStrings(lang)

  // Kart açıkken Escape kapatsın ve arkadaki menü kaymasın.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="item-detail-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      onClick={onClose}
    >
      {/* Kartın içine yapılan tıklama kartı kapatmasın. */}
      <div className="item-detail" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="item-detail-close"
          onClick={onClose}
          aria-label={strings.close}
        >
          ✕
        </button>

        {item.image ? (
          <div className="item-detail-photo">
            <Image
              src={item.image.src}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              sizes={`(max-width: ${DETAIL_WIDTH}px) 100vw, ${DETAIL_WIDTH}px`}
              priority
            />
          </div>
        ) : null}

        <div className="item-detail-body">
          <div className="item-detail-head">
            <h3 className="item-detail-name">{item.name}</h3>
            {item.soldOut ? (
              <span className="item-soldout">{strings.soldOut}</span>
            ) : item.price ? (
              <span className="item-price">{formatPrice(item.price)}</span>
            ) : null}
          </div>

          {item.size || item.calories ? (
            <div className="item-detail-meta">
              {item.size ? <span>{item.size}</span> : null}
              {item.calories ? (
                <span>
                  {item.calories} {strings.calories}
                </span>
              ) : null}
            </div>
          ) : null}

          {item.desc ? <p className="item-detail-desc">{item.desc}</p> : null}
        </div>
      </div>
    </div>
  )
}
