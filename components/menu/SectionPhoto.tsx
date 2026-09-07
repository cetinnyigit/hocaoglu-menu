import Image from 'next/image'
import type { MenuImage } from '@/lib/menu-data/types'

/** İçerik genişliği: .wrap 640px - 2×16px padding. */
const CONTENT_WIDTH = 608

export function SectionPhoto({
  image,
  spaced,
}: {
  image: MenuImage
  spaced?: boolean
}) {
  return (
    <div className={spaced ? 'section-photo spaced' : 'section-photo'}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={`(max-width: ${CONTENT_WIDTH}px) 100vw, ${CONTENT_WIDTH}px`}
        loading="lazy"
      />
    </div>
  )
}
