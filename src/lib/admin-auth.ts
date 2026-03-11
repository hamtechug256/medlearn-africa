import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

// Admin credentials - in production, use environment variables
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'medlearn2024'
const SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'medlearn-admin-secret-key-2024'

const key = new TextEncoder().encode(SECRET_KEY)

export interface AdminSession {
  username: string
  role: 'super_admin'
  loggedInAt: number
}

// Verify admin credentials
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Create admin session token
export async function createAdminSession(username: string): Promise<string> {
  const session: AdminSession = {
    username,
    role: 'super_admin',
    loggedInAt: Date.now()
  }
  
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
  
  return token
}

// Verify admin session token
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

// Get current admin session from cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    
    if (!token) return null
    
    return await verifyAdminSession(token)
  } catch {
    return null
  }
}

// Check if user is authenticated admin
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

// Set admin session cookie
export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

// Clear admin session cookie
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
