import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes and admin login page
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check for auth token cookie (simple cookie check)
  const authToken = request.cookies.get('sb-access-token')?.value || 
                    request.cookies.get('supabase-auth-token')?.value

  // If no auth token, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
