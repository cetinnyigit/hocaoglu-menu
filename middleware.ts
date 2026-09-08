import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, canEdit, readSession } from '@/lib/auth'

/**
 * /admin altındaki her şey oturum ister. Giriş sayfası muaf, yoksa
 * kullanıcı sonsuz yönlendirmeye girer.
 *
 * Oturum ayrıca hangi esnafa ait olduğunu taşır: /admin/<slug> yolunda
 * kapsam tutmuyorsa istek kendi paneline geri gönderilir.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

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
  matcher: '/admin/:path*',
}
