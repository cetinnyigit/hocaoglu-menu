import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { logout, saveMenu } from '../actions'
import { getRestaurant } from '@/lib/menu-data'
import { cardKey, itemKey } from '@/lib/menu-key'
import { applyOverrides } from '@/lib/menu-merge'
import { isBlobConfigured, readOverridesFresh } from '@/lib/menu-store'

export const metadata: Metadata = {
  title: 'Menü Paneli',
  robots: { index: false, follow: false },
}

/** Panel her zaman kayıtlı son hâli göstermeli, cache'lenmemeli. */
export const dynamic = 'force-dynamic'

type Props = {
  params: { slug: string }
  searchParams: { kaydedildi?: string; hata?: string }
}

type Row = { key: string; name: string; price: string; soldOut: boolean }
type Group = { label?: string; rows: Row[] }
type Block = { sectionId: string; sectionLabel: string; groups: Group[] }

/** Menü yapısını panel formunun ihtiyaç duyduğu düz satırlara çevirir. */
function buildBlocks(
  restaurant: ReturnType<typeof getRestaurant>,
): Block[] {
  if (!restaurant) return []

  return restaurant.sections.map((section) => {
    const groups: Group[] = []

    for (const block of section.blocks) {
      if (block.kind === 'cards') {
        groups.push({
          label: 'Kahvaltı tabakları',
          rows: block.cards.map((card) => ({
            key: cardKey(section.id, card.name),
            name: card.name,
            price: card.price ?? '',
            soldOut: card.soldOut ?? false,
          })),
        })
      } else if (block.kind === 'group') {
        groups.push({
          label: block.title,
          rows: block.items.map((item) => ({
            key: itemKey(section.id, block.title, item.name),
            name: item.name,
            price: item.price ?? '',
            soldOut: item.soldOut ?? false,
          })),
        })
      }
    }

    return {
      sectionId: section.id,
      sectionLabel: section.navLabel,
      groups,
    }
  })
}

export default async function AdminEditorPage({ params, searchParams }: Props) {
  const base = getRestaurant(params.slug)
  if (!base) notFound()

  const overrides = await readOverridesFresh(params.slug)
  const restaurant = applyOverrides(base, overrides)
  const blocks = buildBlocks(restaurant)
  const totalRows = blocks.reduce(
    (sum, block) => sum + block.groups.reduce((n, g) => n + g.rows.length, 0),
    0,
  )

  const save = saveMenu.bind(null, params.slug)

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <h1 className="admin-title">{restaurant.name}</h1>
          <p className="admin-subtitle">{totalRows} ürün</p>
        </div>
        <div className="admin-header-actions">
          <Link className="admin-link" href={`/menu/${params.slug}`} target="_blank">
            Menüyü gör
          </Link>
          <form action={logout}>
            <button className="admin-link admin-link-button" type="submit">
              Çıkış
            </button>
          </form>
        </div>
      </header>

      {searchParams.kaydedildi ? (
        <p className="admin-success" role="status">
          Kaydedildi. Menü sayfası güncellendi.
        </p>
      ) : null}

      {searchParams.hata ? (
        <p className="admin-error" role="alert">
          Kaydedilemedi: {searchParams.hata}
        </p>
      ) : null}

      {!isBlobConfigured() ? (
        <p className="admin-error" role="alert">
          Blob deposu bağlı değil (BLOB_READ_WRITE_TOKEN yok). Kaydetme
          çalışmaz. Vercel projesine Private bir Blob store bağlayıp yeniden
          deploy et.
        </p>
      ) : null}

      <p className="admin-hint">
        Fiyatı boş bırakılan ürünlerde menüde fiyat yerine renkli çubuk
        görünür. &quot;Tükendi&quot; işaretlenen ürün menüde soluk gösterilir ve
        fiyatı gizlenir.
      </p>

      <form action={save}>
        {blocks.map((block) => (
          <section className="admin-section" key={block.sectionId}>
            <h2 className="admin-section-title">{block.sectionLabel}</h2>

            {block.groups.map((group, i) => (
              <div key={i}>
                {group.label ? (
                  <h3 className="admin-group-title">{group.label}</h3>
                ) : null}

                <div className="admin-rows">
                  {group.rows.map((row) => (
                    <div className="admin-row" key={row.key}>
                      <label className="admin-row-name" htmlFor={`fiyat:${row.key}`}>
                        {row.name}
                      </label>

                      <input
                        className="admin-price"
                        id={`fiyat:${row.key}`}
                        name={`fiyat:${row.key}`}
                        type="text"
                        inputMode="decimal"
                        defaultValue={row.price}
                        placeholder="—"
                        maxLength={24}
                        autoComplete="off"
                      />

                      <label className="admin-soldout">
                        <input
                          type="checkbox"
                          name={`tukendi:${row.key}`}
                          defaultChecked={row.soldOut}
                        />
                        <span>Tükendi</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}

        <div className="admin-savebar">
          <button className="admin-button" type="submit">
            Kaydet
          </button>
        </div>
      </form>
    </div>
  )
}
