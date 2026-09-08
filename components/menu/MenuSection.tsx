import { Fragment } from 'react'
import { formatPrice } from '@/lib/format-price'
import type { MenuSection as MenuSectionType } from '@/lib/menu-data/types'
import { ItemList } from './ItemList'
import { MenuCards } from './MenuCards'
import { SectionPhoto } from './SectionPhoto'

export function MenuSection({ section }: { section: MenuSectionType }) {
  const headingClass =
    section.headingStyle === 'script'
      ? 'script-heading'
      : `plain-heading${section.headingInk ? ' ink' : ''}`

  return (
    <section className={`section theme-${section.theme}`} id={section.id}>
      <h2 className={headingClass}>{section.heading}</h2>

      {section.blocks.map((block, i) => {
        switch (block.kind) {
          case 'note':
            return (
              <div
                className={
                  block.soldOut ? 'kahvalti-note is-soldout' : 'kahvalti-note'
                }
                key={i}
              >
                <div className="kahvalti-note-head">
                  <b>{block.title}</b>

                  {block.soldOut ? (
                    <span className="item-soldout">Tükendi</span>
                  ) : block.price ? (
                    <span className="item-price">
                      {formatPrice(block.price)}
                    </span>
                  ) : (
                    <span className="item-bars" aria-hidden="true">
                      <span className="b1" />
                      <span className="b2" />
                    </span>
                  )}
                </div>
                {block.body}
              </div>
            )
          case 'cards':
            return <MenuCards cards={block.cards} key={i} />
          case 'photo':
            return (
              <SectionPhoto image={block.image} spaced={block.spaced} key={i} />
            )
          case 'group':
            return (
              // Fragment: sarmalayıcı div eklemek margin collapse davranışını
              // değiştirebilirdi, orijinal dikey ritmi bozmamak için düz sibling.
              <Fragment key={i}>
                {block.title ? (
                  <p className="subgroup-title">{block.title}</p>
                ) : null}
                <ItemList items={block.items} />
              </Fragment>
            )
        }
      })}
    </section>
  )
}
