'use client'

import { useRef, useState } from 'react'

export type ItemImage = { src: string; width: number; height: number }

/**
 * Menüde kullanılan en büyük ölçü ~520px; 1400px hem retina için fazlasıyla
 * yeterli hem de dosyayı birkaç yüz KB'de tutuyor.
 */
const MAX_EDGE = 1400
const JPEG_QUALITY = 0.82
const DESC_MAX = 400

/**
 * Telefonla çekilmiş 4-5 MB'lık fotoğrafı olduğu gibi göndermiyoruz:
 * tarayıcıda küçültüp JPEG'e çeviriyoruz. Hem yükleme saniyeler sürmüyor
 * hem de sunucu gövde sınırlarına takılmıyoruz.
 *
 * imageOrientation: EXIF'te "döndür" bilgisi olan telefon fotoğrafları
 * yan yatmasın diye.
 */
async function kucult(
  file: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Görsel işlenemedi')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
  if (!blob) throw new Error('Görsel dönüştürülemedi')

  return { blob, width, height }
}

/**
 * Bir ürünün fiyat dışındaki alanları: fotoğraf, içerik ve kalori.
 *
 * Fotoğraf seçilir seçilmez yükleniyor ve adresi gizli alana yazılıyor;
 * kalıcı olması için formdaki "Kaydet"e basılması gerekiyor — diğer
 * alanlarla aynı davranış, esnaf için tek bir kaydetme adımı kalıyor.
 */
export function ItemDetailFields({
  slug,
  itemKey,
  name,
  desc,
  calories,
  image,
}: {
  slug: string
  itemKey: string
  name: string
  desc: string
  calories: string
  image: ItemImage | null
}) {
  const [current, setCurrent] = useState<ItemImage | null>(image)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPick(file: File) {
    setBusy(true)
    setError('')

    try {
      const { blob, width, height } = await kucult(file)

      const body = new FormData()
      body.set('slug', slug)
      body.set('anahtar', itemKey)
      body.set('dosya', blob, 'urun.jpg')
      body.set('genislik', String(width))
      body.set('yukseklik', String(height))

      const response = await fetch('/api/admin/gorsel', {
        method: 'POST',
        body,
      })
      const data = (await response.json()) as
        | ItemImage
        | { hata?: string }

      if (!response.ok || !('src' in data)) {
        throw new Error(
          ('hata' in data && data.hata) || 'Görsel yüklenemedi',
        )
      }

      setCurrent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görsel yüklenemedi')
    } finally {
      setBusy(false)
      // Aynı dosya tekrar seçilebilsin diye input sıfırlanıyor.
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <details className="admin-detail">
      <summary className="admin-detail-summary">
        Fotoğraf ve içerik
        {current || desc || calories ? (
          <span className="admin-detail-badge">dolu</span>
        ) : null}
      </summary>

      <div className="admin-detail-body">
        <div className="admin-detail-photo">
          {current ? (
            // next/image değil: panelde tek seferlik önizleme, üstelik
            // adres her yüklemede değişiyor — optimizasyonun faydası yok.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.src} alt={`${name} fotoğrafı`} />
          ) : (
            <span className="admin-detail-empty">Fotoğraf yok</span>
          )}

          <div className="admin-detail-photo-actions">
            <label className="admin-file">
              {busy ? 'Yükleniyor…' : current ? 'Değiştir' : 'Fotoğraf seç'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void onPick(file)
                }}
              />
            </label>

            {current ? (
              <button
                type="button"
                className="admin-link admin-link-button"
                onClick={() => setCurrent(null)}
                disabled={busy}
              >
                Kaldır
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : null}

        {/* Görselin adresi ve ölçüsü formla birlikte kaydediliyor. */}
        <input type="hidden" name={`gorsel:${itemKey}`} value={current?.src ?? ''} />
        <input
          type="hidden"
          name={`gorselg:${itemKey}`}
          value={current?.width ?? ''}
        />
        <input
          type="hidden"
          name={`gorsely:${itemKey}`}
          value={current?.height ?? ''}
        />

        <label className="admin-label" htmlFor={`aciklama:${itemKey}`}>
          İçindekiler
        </label>
        <textarea
          className="admin-input admin-textarea"
          id={`aciklama:${itemKey}`}
          name={`aciklama:${itemKey}`}
          defaultValue={desc}
          rows={3}
          maxLength={DESC_MAX}
          placeholder="Ör. Döner et, tereyağlı domates sos, yoğurt ve pide."
        />

        <label className="admin-label admin-label-spaced" htmlFor={`kalori:${itemKey}`}>
          Kalori (kcal)
        </label>
        <input
          className="admin-input admin-calories"
          id={`kalori:${itemKey}`}
          name={`kalori:${itemKey}`}
          type="text"
          inputMode="numeric"
          defaultValue={calories}
          placeholder="—"
          maxLength={5}
          autoComplete="off"
        />
      </div>
    </details>
  )
}
