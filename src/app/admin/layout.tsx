import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  BookOpen, 
  Calendar,
  Settings,
  LogOut,
  Upload,
  Database,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/topics', label: 'Topics', icon: FileText },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/course-units', label: 'Course Units', icon: BookOpen },
  { href: '/admin/semesters', label: 'Semesters', icon: Calendar },
  { href: '/admin/migrate', label: 'Data Migration', icon: Database },
]

function SidebarContent() {
  return (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold text-lg">
          <Settings className="h-6 w-6 text-primary" />
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <form action="/api/auth/logout" method="post">
          <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
        <SidebarContent />
      </aside>
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Settings className="h-5 w-5 text-primary" />
            <span>Admin</span>
          </Link>
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
