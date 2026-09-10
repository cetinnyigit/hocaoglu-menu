import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, canEdit, readSession } from '@/lib/auth'
import { restaurantDomain, slugForHost } from '@/lib/domains'

/**
 * İki iş yapıyor:
 *
 * 1) Alan adı yönlendirmesi. Kendi alan adı olan esnafta (bkz. lib/domains.ts)
 *    kök adres o esnafın menüsünü gösterir; menünün ana sitedeki eski adresi
 *    kalıcı olarak yeni alan adına yönlenir. Böylece her menünün tek bir
 *    herkese açık adresi olur.
 *
 * 2) Panel girişi. /admin altındaki her şey oturum ister ve oturum hangi
 *    esnafa ait olduğunu taşır; başkasının paneline geçilemez.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostSlug = slugForHost(
    request.headers.get('host') ?? request.nextUrl.hostname,
  )

  if (pathname.startsWith('/admin')) {
    return adminGuard(request)
  }

  if (hostSlug) {
    // Esnafın kendi alan adı. Kök adres menüyü gösterir; adres çubuğunda
    // /menu/<slug> görünmesin diye redirect değil rewrite kullanıyoruz.
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/menu/${hostSlug}`, request.url))
    }

    // /menu/... yolları bu alan adında yok sayılır: kendi menüsünün tekrar
    // adresi de, başka esnafın menüsü de köke toplanır. Bu alan adı tek bir
    // işletmeye ait, müşteriler birbirinin menüsünü görmüyor.
    if (pathname.startsWith('/menu/')) {
      return NextResponse.redirect(new URL('/', request.url), 308)
    }

    return NextResponse.next()
  }

  // Ana site: kendi alan adına taşınmış menünün eski adresi yeni adrese
  // gitsin. Paylaşılmış bağlantılar kırılmaz, arama motorunda tek adres kalır.
  const menuSlug = pathname.startsWith('/menu/')
    ? pathname.split('/')[2]
    : undefined
  const ownDomain = menuSlug ? restaurantDomain(menuSlug) : undefined
  if (ownDomain) {
    return NextResponse.redirect(`https://${ownDomain}${search}`, 308)
  }

  return NextResponse.next()
}

async function adminGuard(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Giriş sayfası muaf, yoksa kullanıcı sonsuz yönlendirmeye girer.
  if (pathname === '/admin/giris') return NextResponse.next()

  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value)

  if (!session) {
    const loginUrl = new URL('/admin/giris', request.url)
    // Giriş sonrası kullanıcıyı gitmek istediği sayfaya geri gönderelim.
    loginUrl.searchParams.set('devam', pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  // /admin/<slug> → başka bir esnafın paneline erişim denemesi.
  const slug = pathname.split('/')[2]
  if (slug && !canEdit(session, slug)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  /**
   * Artık yalnızca /admin değil, kök adres de middleware'den geçmeli.
   * Statik dosyalar ve görseller hariç tutuluyor — onlar için host
   * yönlendirmesi anlamsız, her istekte middleware çalıştırmak israf.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)',
  ],
}
