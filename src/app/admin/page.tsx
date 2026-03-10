import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, FolderTree, BookOpen, Calendar, Database } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const stats = [
    { 
      title: 'Total Topics', 
      value: '457', 
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      title: 'Categories', 
      value: '10', 
      icon: FolderTree,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    { 
      title: 'Course Units', 
      value: '24', 
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    { 
      title: 'Semesters', 
      value: '6', 
      icon: Calendar,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Medlearn Africa admin panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link 
              href="/admin/topics" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Manage Topics</span>
            </Link>
            <Link 
              href="/admin/categories" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <FolderTree className="h-4 w-4" />
              <span>Manage Categories</span>
            </Link>
            <Link 
              href="/admin/migrate" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Database className="h-4 w-4" />
              <span>Migrate Data to Supabase</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to use this admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>First, run the SQL schema in Supabase SQL Editor</li>
              <li>Then run the Data Migration on this site</li>
              <li>Add or edit topics using the Topics page</li>
              <li>Organize topics into categories and course units</li>
              <li>Upload images for topics as needed</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
