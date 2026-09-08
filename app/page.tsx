import type { Metadata } from 'next'

/**
 * Alan adının kök sayfası. Bilerek tanıtım sayfası: buradan hiçbir müşteri
 * menüsüne ya da panele bağlantı verilmiyor — menülere yalnızca kartındaki
 * QR/NFC ile gidiliyor, müşteriler birbirinin menüsünü görmüyor.
 */
export const metadata: Metadata = {
  title: 'Dijital Menü — NFC ve QR ile açılan restoran menüleri',
  description:
    'Kartı okutan müşteri menüyü anında görür. Uygulama indirmek yok, ' +
    'fiyatları kendiniz güncellersiniz. NFC ve QR tek kartta.',
}

const FEATURES = [
  {
    title: 'Fiyatı kendiniz güncellersiniz',
    body: 'Kendi şifrenizle panele girip fiyatı değiştirin; menü aynı anda güncellenir. Yeni kart bastırmaya, kimseyi aramaya gerek yok.',
  },
  {
    title: 'Uygulama indirmek yok',
    body: 'Müşteri kartı telefonuna okutur, menü tarayıcıda açılır. Kurulum, üyelik, bekleme yok.',
  },
  {
    title: 'Tek kartta NFC + QR',
    body: 'Telefonu değdiren de, kamerayla okutan da aynı menüye ulaşır. Eski telefonlar QR ile sorunsuz açar.',
  },
  {
    title: 'Tükenen ürünü işaretleyin',
    body: 'Kalmayan ürünü panelden işaretleyin; menüde soluk görünür ve fiyatı gizlenir. Müşteri sipariş verip hayal kırıklığı yaşamaz.',
  },
  {
    title: 'İşletmenize göre tasarım',
    body: 'Menü sizin fotoğraflarınız, bölümleriniz ve renklerinizle hazırlanır. Hazır şablon kalabalığı değil.',
  },
  {
    title: 'Hızlı açılır',
    body: 'Sayfa önceden hazırlanmış olarak sunulur; masada bekleyen müşteri menüyü anında görür.',
  },
]

const STEPS = [
  {
    n: '1',
    title: 'Menünüzü gönderin',
    body: 'Mevcut menünüzün fotoğrafı ya da listesi yeterli. Ürün fotoğraflarınız varsa onları da ekleriz.',
  },
  {
    n: '2',
    title: 'Menünüzü hazırlayalım',
    body: 'Bölümler, ürünler ve tasarım işletmenize göre kurulur. Onayınızı alırız.',
  },
  {
    n: '3',
    title: 'Kartlarınız elinizde',
    body: 'NFC ve QR basılı kartlarınızı teslim alırsınız. Panel şifreniz size özel verilir.',
  },
]

export default function Home() {
  return (
    <main className="home">
      <section className="home-hero">
        <p className="home-eyebrow">Dijital Menü</p>
        <h1 className="home-title">
          Kartı okutun,
          <br />
          <span className="script home-title-script">menü açılsın</span>
        </h1>
        <p className="home-lead">
          Restoranlar, kafeler ve pastaneler için NFC ve QR ile açılan dijital
          menü. Fiyat değiştiğinde kart değişmez — menüyü siz güncellersiniz.
        </p>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Neler sunuyor</h2>
        <div className="home-grid">
          {FEATURES.map((feature) => (
            <div className="home-card" key={feature.title}>
              <h3 className="home-card-title">{feature.title}</h3>
              <p className="home-card-body">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Nasıl çalışır</h2>
        <ol className="home-steps">
          {STEPS.map((step) => (
            <li className="home-step" key={step.n}>
              <span className="home-step-n" aria-hidden="true">
                {step.n}
              </span>
              <div>
                <h3 className="home-card-title">{step.title}</h3>
                <p className="home-card-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section home-contact">
        <h2 className="home-section-title">İletişim</h2>
        <p className="home-card-body">
          İşletmeniz için menü hazırlatmak isterseniz yazın, aynı gün dönüş
          yapayım.
        </p>
        <div className="home-contact-links">
          <a className="home-button" href="mailto:cetinnyigit34@gmail.com">
            cetinnyigit34@gmail.com
          </a>
        </div>
      </section>

      <footer className="home-footer">
        cetinnyigit.com — Dijital menü çözümleri
      </footer>
    </main>
  )
}
