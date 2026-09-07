'use client'

import { useEffect, useState } from 'react'
import type { MenuSection } from '@/lib/menu-data/types'

/**
 * Yapışkan kategori çubuğu. Sayfadaki tek client bileşeni — geri kalan
 * her şey server'da render ediliyor.
 *
 * Aktif kategori mantığı orijinal HTML ile birebir aynı: viewport'un
 * 120px üstünden geçmiş son bölüm aktif sayılır. Scroll dinleyicisi
 * passive ve rAF ile sınırlandırıldı, mobilde kaydırma takılmasın.
 */
export function CategoryNav({ sections }: { sections: MenuSection[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      let current = ''
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top < 120) current = section.id
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

  return (
    <nav className="catnav" id="catnav">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={activeId === section.id ? 'active' : undefined}
        >
          {section.navLabel}
        </a>
      ))}
    </nav>
  )
}
