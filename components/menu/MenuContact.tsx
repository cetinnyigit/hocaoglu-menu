import type {
  MenuLang,
  MenuContact as MenuContactType,
} from '@/lib/menu-data/types'
import { DEFAULT_LANG, menuStrings } from '@/lib/menu-i18n'

/** tel: bağlantısı için boşluk/parantez/tire temizliği. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/**
 * Menünün en altındaki iletişim bloğu: adres, telefon, Instagram, saatler.
 * Telefon ve adres tıklanabilir — müşteri menüden çıkmadan arayabilsin ya da
 * haritayı açabilsin.
 */
export function MenuContact({
  contact,
  lang = DEFAULT_LANG,
}: {
  contact: MenuContactType
  lang?: MenuLang
}) {
  const { address, phones, instagram, hours, mapsUrl } = contact
  const strings = menuStrings(lang)
  const phoneList = phones?.filter(Boolean) ?? []
  if (!address && !mapsUrl && phoneList.length === 0 && !instagram && !hours) {
    return null
  }

  return (
    <section className="contact" aria-label={strings.contactTitle}>
      <h2 className="contact-title">{strings.contactTitle}</h2>

      <div className="contact-rows">
        {/* Açık adres yazılmadıysa satır yine de durur, yalnızca harita
            bağlantısı gösterilir — müşteri yol tarifini yine alabilsin. */}
        {address || mapsUrl ? (
          <div className="contact-row">
            <span className="contact-label">{strings.address}</span>
            {mapsUrl ? (
              <a
                className="contact-value contact-link"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address ?? strings.openInMaps}
              </a>
            ) : (
              <span className="contact-value">{address}</span>
            )}
          </div>
        ) : null}

        {phoneList.length > 0 ? (
          <div className="contact-row">
            <span className="contact-label">{strings.phone}</span>
            <span className="contact-value contact-phones">
              {phoneList.map((phone) => (
                <a className="contact-link" href={telHref(phone)} key={phone}>
                  {phone}
                </a>
              ))}
            </span>
          </div>
        ) : null}

        {instagram ? (
          <div className="contact-row">
            <span className="contact-label">{strings.instagram}</span>
            <a
              className="contact-value contact-link"
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{instagram}
            </a>
          </div>
        ) : null}

        {hours ? (
          <div className="contact-row">
            <span className="contact-label">{strings.hours}</span>
            <span className="contact-value">{hours}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
