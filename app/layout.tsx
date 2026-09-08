import type { Metadata, Viewport } from 'next'
import { Poppins, Yellowtail } from 'next/font/google'
import './globals.css'

/**
 * Fontlar next/font ile self-host ediliyor: Google'a runtime isteği yok,
 * font dosyaları kendi domainimizden gelir. NFC ile açılan mobil
 * bağlantılarda ekstra DNS + TLS turunu ortadan kaldırır.
 */
const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

/**
 * DİKKAT: Yellowtail'in yalnızca `latin` alt kümesi var; ı, ş, ğ, İ
 * glifleri fontta yok ve tarayıcı bu harflerde cursive fallback'e düşer
 * ("günaydın", "Dumanı üstünde", "Şeker Tadında"). Orijinal HTML'de de
 * durum aynıydı, davranış bilerek korundu.
 */
const yellowtail = Yellowtail({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-yellowtail',
  display: 'swap',
})

/** Open Graph görsellerinin mutlak URL'e çevrilmesi için gerekli. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cetinnyigit.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Menü',
  description: 'Dijital esnaf menüleri',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf6ee',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${poppins.variable} ${yellowtail.variable}`}>
      <body>{children}</body>
    </html>
  )
}
