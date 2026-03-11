import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  BookOpen,
  Calendar,
  Settings,
  Database,
  Users,
  Shield,
  BarChart3,
  Bell,
  FileEdit,
  Image,
  Tag
} from 'lucide-react'
import { cookies } from 'next/headers'
import { verifyAdminSession } from '@/lib/admin-auth'
import { LogoutButton } from './logout-button'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/topics', label: 'Topics', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/course-units', label: 'Course Units', icon: BookOpen },
  { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/content', label: 'Content Editor', icon: FileEdit },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/tags', label: 'Tags & Labels', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/migrate', label: 'Data Migration', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const navSections = [
  {
    title: 'Content',
    items: navItems.filter(item => ['Topics', 'Categories', 'Course Units', 'Semesters', 'Content Editor', 'Media Library', 'Tags & Labels'].includes(item.label))
  },
  {
    title: 'System',
    items: navItems.filter(item => ['Dashboard', 'Users', 'Analytics', 'Notifications', 'Data Migration', 'Settings'].includes(item.label))
  }
]

async function getAdminSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value
    if (!token) return null
    return await verifyAdminSession(token)
  } catch {
    return null
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/auth/admin-login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
            <Shield className="h-6 w-6 text-primary" />
            <span>Admin Panel</span>
          </Link>
        </div>

        {session && (
          <div className="px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {session.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{session.username}</div>
                <div className="text-xs text-muted-foreground">Super Admin</div>
              </div>
            </div>
          </div>
        )}

        {session && (
          <nav className="flex-1 overflow-y-auto p-2">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                <h3 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}

        {session && (
          <div className="border-t p-4">
            <LogoutButton />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:hidden bg-background">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            <span>Admin</span>
          </Link>
          {session && (
            <div className="ml-auto">
              <LogoutButton />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
