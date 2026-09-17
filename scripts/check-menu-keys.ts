/**
 * Menü verisi değiştiğinde çalıştır. İki şeye bakar:
 *
 * 1) İki ürün aynı fiyat anahtarını üretiyor mu — üretiyorsa panelden
 *    girilen fiyatlar birbirine karışır.
 * 2) Çeviri tablosundaki anahtarların karşılığı menüde var mı — ürün adı
 *    değişince çeviri sessizce düşmesin.
 *
 *   npm run check:keys
 */
import { restaurants } from '../lib/menu-data'
import { collectEditableEntries, findDuplicateKeys } from '../lib/menu-key'
import { TRANSLATION_LANGS } from '../lib/menu-i18n'

let failed = false

for (const restaurant of restaurants) {
  const entries = collectEditableEntries(restaurant)
  const duplicates = findDuplicateKeys(restaurant)

  console.log(
    `${restaurant.slug}: ${entries.length} düzenlenebilir alan, ${duplicates.length} çakışma`,
  )

  // Çeviri anahtarları ürün anahtarlarıyla eşleşmeli. Eşleşmeyen anahtar
  // menüde görünmez ve o ürün turist müşteriye Türkçe adıyla çıkar.
  const known = new Set(entries.map((e) => e.key))
  for (const lang of TRANSLATION_LANGS) {
    const translation = restaurant.translations?.[lang]
    if (!translation) continue

    const sectionIds = new Set(restaurant.sections.map((s) => s.id))
    for (const sectionId of Object.keys(translation.sections ?? {})) {
      if (sectionIds.has(sectionId)) continue
      failed = true
      console.error(`  ${lang}: bölüm karşılığı yok -> ${sectionId}`)
    }

    const keys = Object.keys(translation.items ?? {})
    const orphan = keys.filter((key) => !known.has(key))
    const missing = entries.filter((e) => !translation.items?.[e.key])

    console.log(
      `  ${lang}: ${keys.length} çeviri, ${orphan.length} karşılıksız, ${missing.length} çevrilmemiş ürün`,
    )

    for (const key of orphan) {
      failed = true
      console.error(`    KARŞILIKSIZ: ${key}`)
    }
    // Çevrilmemiş ürün hata değil: menü yarım çeviriyle de yayınlanabilir,
    // o satır Türkçe adıyla görünür. Sadece sayısı yazdırılıyor.
  }

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
