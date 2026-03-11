import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/admin-auth'

export async function POST() {
  try {
    await clearAdminCookie()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
