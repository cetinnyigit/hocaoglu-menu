/**
 * Karta bastırmak için QR üretir.
 *
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

const OPTIONS = {
  errorCorrectionLevel: 'H',
  // Sessiz alan. 4 modül QR standardının istediği minimum; daha azı
  // bazı okuyucularda sorun çıkarır.
  margin: 4,
  color: { dark: '#000000', light: '#FFFFFF' },
} as const

async function main() {
  const [url, rawName] = process.argv.slice(2)

  if (!url) {
    console.error(
      'Kullanım: npm run qr -- <url> [dosya-adı]\n' +
        'Örnek:    npm run qr -- https://ornek.com/menu/hocaoglu hocaoglu',
    )
    process.exit(1)
  }

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

  const name = rawName ?? 'menu'
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
