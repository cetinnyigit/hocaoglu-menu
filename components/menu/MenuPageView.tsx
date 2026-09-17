import { CategoryNav } from '@/components/menu/CategoryNav'
import { LanguageSwitch } from '@/components/menu/LanguageSwitch'
import { MenuContact } from '@/components/menu/MenuContact'
import { MenuHero } from '@/components/menu/MenuHero'
import { MenuSection } from '@/components/menu/MenuSection'
import type { MenuLang, Restaurant } from '@/lib/menu-data/types'
import { availableLangs, langDir } from '@/lib/menu-i18n'

/**
 * Menü sayfasının gövdesi. Hem /menu/<slug> (Türkçe) hem de
 * /menu/<slug>/<dil> route'u bunu basıyor; ikisi arasındaki tek fark
 * hangi dilin çevrildiği.
 *
 * Gelen restaurant zaten çevrilmiş ve panel değerleri bindirilmiş olmalı.
 */
export function MenuPageView({
  restaurant,
  lang,
}: {
  restaurant: Restaurant
  lang: MenuLang
}) {
  const langs = availableLangs(restaurant)

  // Esnafa özel palet varsa renk değişkenleri bu sarmalayıcıdan miras alınır.
  // dir yalnızca menüyü kapsıyor: sayfanın geri kalanı (panel, tanıtım)
  // Türkçe ve soldan sağa kalmaya devam ediyor.
  return (
    <div
      className={restaurant.palette ? `brand-${restaurant.palette}` : ''}
      dir={langDir(lang)}
      lang={lang}
    >
      <MenuHero restaurant={restaurant}>
        <LanguageSwitch slug={restaurant.slug} langs={langs} current={lang} />
      </MenuHero>

      <CategoryNav sections={restaurant.sections} />

      <div className="wrap">
        {restaurant.sections.map((section) => (
          <MenuSection section={section} lang={lang} key={section.id} />
        ))}

        {restaurant.contact ? (
          <MenuContact contact={restaurant.contact} lang={lang} />
        ) : null}
      </div>

      <div className="footer">
        {restaurant.footer.text}
        <br />
        <span className="vat">{restaurant.footer.vatNote}</span>
      </div>
    </div>
  )
}
