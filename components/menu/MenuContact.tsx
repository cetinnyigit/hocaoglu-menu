import type { MenuContact as MenuContactType } from '@/lib/menu-data/types'

/** tel: bağlantısı için boşluk/parantez/tire temizliği. */
function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

/**
 * Menünün en altındaki iletişim bloğu: adres, telefon, Instagram, saatler.
 * Telefon ve adres tıklanabilir — müşteri menüden çıkmadan arayabilsin ya da
 * haritayı açabilsin.
 */
export function MenuContact({ contact }: { contact: MenuContactType }) {
  const { address, phones, instagram, hours, mapsUrl } = contact
  const phoneList = phones?.filter(Boolean) ?? []
  if (!address && phoneList.length === 0 && !instagram && !hours) return null

  return (
    <section className="contact" aria-label="İletişim">
      <h2 className="contact-title">İletişim</h2>

      <div className="contact-rows">
        {address ? (
          <div className="contact-row">
            <span className="contact-label">Adres</span>
            {mapsUrl ? (
              <a
                className="contact-value contact-link"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address}
              </a>
            ) : (
              <span className="contact-value">{address}</span>
            )}
          </div>
        ) : null}

        {phoneList.length > 0 ? (
          <div className="contact-row">
            <span className="contact-label">Telefon</span>
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
            <span className="contact-label">Instagram</span>
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
            <span className="contact-label">Saatler</span>
            <span className="contact-value">{hours}</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
