import { NextResponse } from 'next/server'
import { verifyCredentials, createAdminSession, setAdminCookie } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    if (!verifyCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createAdminSession(username)
    await setAdminCookie(token)

    return NextResponse.json({ success: true, message: 'Login successful' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

export async function GET() {
  const { isAdminAuthenticated } = await import('@/lib/admin-auth')
  const isAuthenticated = await isAdminAuthenticated()
  return NextResponse.json({ authenticated: isAuthenticated })
}
