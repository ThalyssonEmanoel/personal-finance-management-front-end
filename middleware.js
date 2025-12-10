import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith("/home")
    const isNoAuthPage = req.nextUrl.pathname.startsWith("/introduction")
    
    // Cache headers for static assets
    if (req.nextUrl.pathname.startsWith('/_next/static') || 
        req.nextUrl.pathname.includes('.jpg') || 
        req.nextUrl.pathname.includes('.png') || 
        req.nextUrl.pathname.includes('.webp')) {
      const response = NextResponse.next()
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      return response
    }
    
    // Se usuário está logado e tenta acessar página de introdução
    if (token && isNoAuthPage) {
      return NextResponse.redirect(new URL("/home", req.url))
    }
    
    // Se usuário não está logado e tenta acessar página protegida
    if (!token && isAuthPage) {
      return NextResponse.redirect(new URL("/introduction", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
