/**
 * Menü verisi değiştiğinde çalıştır: iki ürün aynı fiyat anahtarını
 * üretiyorsa panelden girilen fiyatlar birbirine karışır.
 *
 *   npm run check:keys
 */
import { restaurants } from '../lib/menu-data'
import { collectEditableEntries, findDuplicateKeys } from '../lib/menu-key'

let failed = false

for (const restaurant of restaurants) {
  const entries = collectEditableEntries(restaurant)
  const duplicates = findDuplicateKeys(restaurant)

  console.log(
    `${restaurant.slug}: ${entries.length} düzenlenebilir alan, ${duplicates.length} çakışma`,
  )

  for (const key of duplicates) {
    failed = true
    console.error(`  ÇAKIŞMA: ${key}`)
    for (const entry of entries.filter((e) => e.key === key)) {
      console.error(
        `    <- ${entry.sectionLabel} / ${entry.groupLabel ?? '(grupsuz)'} / ${entry.name}`,
      )
    }
  }
}

if (failed) {
  console.error(
    '\nÇakışan anahtarlar var. İlgili ürün adlarını veya grup başlıklarını ayrıştır.',
  )
  process.exit(1)
}

console.log('Çakışma yok.')
