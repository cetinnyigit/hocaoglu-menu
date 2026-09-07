/**
 * Menüde gösterilecek fiyatı biçimlendirir.
 *
 * Panele "1000" yazmak yeterli, sonuna TL kendiliğinden eklenir. Zaten bir
 * para birimi yazılmışsa ("1000 TL", "₺1000") olduğu gibi bırakılır — yoksa
 * "1000 TL TL" gibi bir şey çıkardı.
 *
 * Biçimlendirme kayıt anında değil gösterim anında yapılıyor; panelde ham
 * değer görünsün ve düzenlemesi kolay olsun diye.
 */
export function formatPrice(price: string | undefined): string {
  const value = price?.trim() ?? ''
  if (!value) return ''
  if (/tl\b|₺|try/i.test(value)) return value
  return `${value} TL`
}
