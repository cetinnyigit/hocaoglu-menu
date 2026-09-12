'use client'

import { useEffect, useRef, useState } from 'react'
import type { MenuSection } from '@/lib/menu-data/types'

/**
 * Yapışkan kategori çubuğu.
 *
 * Aktif kategori mantığı orijinal HTML ile birebir aynı: viewport'un
 * 120px üstünden geçmiş son bölüm aktif sayılır. Scroll dinleyicisi
 * passive ve rAF ile sınırlandırıldı, mobilde kaydırma takılmasın.
 *
 * Aktif hap ayrıca çubuğun içinde ortaya kaydırılıyor: menüde aşağı
 * inildikçe sıradaki kategoriler kendiliğinden görünür oluyor, müşteri
 * çubuğu elle sağa çekmek zorunda kalmıyor.
 */
export function CategoryNav({ sections }: { sections: MenuSection[] }) {
  const [activeId, setActiveId] = useState('')
  const navRef = useRef<HTMLElement | null>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      // Eşik nav yüksekliğinden türetiliyor; çubuğun boyutu değişince
      // sabit bir sayıyı güncellemeyi unutma riski kalmıyor.
      const navHeight = navRef.current?.offsetHeight ?? 0
      const threshold = navHeight + 50

      let current = ''
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top < threshold) current = section.id
      }
      setActiveId(current)
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [sections])

  // Aktif hapı yatayda ortala. scrollIntoView yerine elle scrollLeft:
  // scrollIntoView en yakın kaydırılabilir atayı da oynatabiliyor ve
  // sayfa dikeyde zıplıyordu.
  useEffect(() => {
    const nav = navRef.current
    const link = activeId ? linkRefs.current[activeId] : null
    if (!nav || !link) return

    const target = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2
    const max = nav.scrollWidth - nav.clientWidth
    const left = Math.max(0, Math.min(target, max))

    // Zaten yerindeyse dokunma; her scroll karesinde smooth animasyon
    // tetiklenmesin.
    if (Math.abs(nav.scrollLeft - left) < 2) return
    nav.scrollTo({ left, behavior: 'smooth' })
  }, [activeId])

  return (
    <nav className="catnav" id="catnav" ref={navRef}>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          ref={(el) => {
            linkRefs.current[section.id] = el
          }}
          className={activeId === section.id ? 'active' : undefined}
        >
          {section.navLabel}
        </a>
      ))}
    </nav>
  )
}
