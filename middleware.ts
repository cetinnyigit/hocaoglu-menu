import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, isValidSession } from '@/lib/auth'

/**
 * /admin altındaki her şey oturum ister. Giriş sayfası muaf, yoksa
 * kullanıcı sonsuz yönlendirmeye girer.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === '/admin/giris') return NextResponse.next()

  const session = request.cookies.get(SESSION_COOKIE)?.value
  if (await isValidSession(session)) return NextResponse.next()

  const loginUrl = new URL('/admin/giris', request.url)
  // Giriş sonrası kullanıcıyı gitmek istediği sayfaya geri gönderelim.
  loginUrl.searchParams.set('devam', pathname + search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: '/admin/:path*',
}
