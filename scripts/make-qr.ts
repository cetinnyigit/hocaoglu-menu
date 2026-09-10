/**
 * Karta bastırmak için QR üretir.
 *
 * Esnaf slug'ı ver, adresi kendi bulsun (kendi alan adı varsa onu kullanır):
 *   npm run qr -- hocaoglu
 *
 * Ya da adresi elle ver:
 *   npm run qr -- https://ornek.com/menu/hocaoglu hocaoglu
 *
 * İki dosya çıkar (qr/ klasörüne):
 *   <ad>-qr.svg  → matbaaya bunu ver. Vektör, hangi boyutta basılırsa
 *                  basılsın kenarlar keskin kalır.
 *   <ad>-qr.png  → 2000px, sadece ekranda göstermek/önizleme için.
 *
 * Hata düzeltme seviyesi H (%30): kartın köşesi çizilse, parmak izi kalsa
 * ya da ortasına küçük bir logo konsa bile okunmaya devam eder.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import QRCode from 'qrcode'
import { restaurantUrl } from '../lib/domains'
import { getRestaurantSlugs } from '../lib/menu-data'

const OPTIONS = {
  errorCorrectionLevel: 'H',
  // Sessiz alan. 4 modül QR standardının istediği minimum; daha azı
  // bazı okuyucularda sorun çıkarır.
  margin: 4,
  color: { dark: '#000000', light: '#FFFFFF' },
} as const

async function main() {
  const [target, rawName] = process.argv.slice(2)

  if (!target) {
    console.error(
      'Kullanım: npm run qr -- <slug|url> [dosya-adı]\n' +
        'Örnek:    npm run qr -- hocaoglu\n' +
        'Örnek:    npm run qr -- https://ornek.com/menu/hocaoglu hocaoglu',
    )
    process.exit(1)
  }

  // Slug verildiyse adresi lib/domains.ts'ten türet — kendi alan adı olan
  // esnafta kart o alan adına basılsın, elle yazıp yanlış adres girilmesin.
  const isUrl = target.includes('://')
  if (!isUrl && !getRestaurantSlugs().includes(target)) {
    console.error(
      `Tanımsız esnaf: ${target}\n` +
        `Bilinen slug'lar: ${getRestaurantSlugs().join(', ')}`,
    )
    process.exit(1)
  }
  const url = isUrl ? target : restaurantUrl(target)

  try {
    // Yazım hatası olan bir adres kartlara basılmasın.
    new URL(url)
  } catch {
    console.error(`Geçersiz adres: ${url}`)
    process.exit(1)
  }

  if (!url.startsWith('https://')) {
    console.error(
      `Uyarı: adres https:// ile başlamıyor (${url}). ` +
        'Kart basılmadan önce kontrol et.',
    )
  }

  const name = rawName ?? (isUrl ? 'menu' : target)
  const outDir = path.join(process.cwd(), 'qr')
  await mkdir(outDir, { recursive: true })

  const svgPath = path.join(outDir, `${name}-qr.svg`)
  const pngPath = path.join(outDir, `${name}-qr.png`)

  const svg = await QRCode.toString(url, { ...OPTIONS, type: 'svg' })
  await writeFile(svgPath, svg, 'utf8')

  await QRCode.toFile(pngPath, url, { ...OPTIONS, type: 'png', width: 2000 })

  console.log(`Adres : ${url}`)
  console.log(`SVG   : ${svgPath}   (matbaaya bunu ver)`)
  console.log(`PNG   : ${pngPath}   (önizleme, 2000px)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
