import Link from 'next/link'
import {
  LANG_LABELS,
  LANG_SHORT,
  menuPath,
  menuStrings,
} from '@/lib/menu-i18n'
import type { MenuLang } from '@/lib/menu-data/types'

/**
 * Hero'nun üstündeki dil hapları. Her dil ayrı bir adres olduğu için düz
 * bağlantı — JavaScript kapalı olsa da çalışır, turist müşteri bağlantıyı
 * paylaşınca karşı taraf da aynı dili açar.
 *
 * Tek dil varsa hiç basılmaz.
 */
export function LanguageSwitch({
  slug,
  langs,
  current,
}: {
  slug: string
  langs: MenuLang[]
  current: MenuLang
}) {
  if (langs.length < 2) return null

  return (
    <nav className="lang-switch" aria-label={menuStrings(current).language}>
      {langs.map((lang) => (
        <Link
          key={lang}
          href={menuPath(slug, lang)}
          className={lang === current ? 'active' : undefined}
          hrefLang={lang}
          lang={lang}
          aria-current={lang === current ? 'true' : undefined}
          aria-label={LANG_LABELS[lang]}
        >
          {LANG_SHORT[lang]}
        </Link>
      ))}
    </nav>
  )
}
