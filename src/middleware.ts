import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only protect admin routes, not the login page
  // Login page handles its own auth check client-side
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }
  
  // For other admin routes, check for Supabase auth cookie
  if (pathname.startsWith('/admin')) {
    // Check for any Supabase auth cookie
    const hasAuth = request.cookies.getAll().some(cookie => 
      cookie.name.includes('sb-') && cookie.name.includes('auth')
    )
    
    if (!hasAuth) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
