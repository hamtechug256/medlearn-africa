import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, FolderTree, BookOpen, Calendar } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get counts
  const { count: topicCount } = await supabase
    .from('topics')
    .select('*', { count: 'exact', head: true })
  
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
  
  const { count: courseUnitCount } = await supabase
    .from('course_units')
    .select('*', { count: 'exact', head: true })
  
  const { count: semesterCount } = await supabase
    .from('semesters')
    .select('*', { count: 'exact', head: true })

  const stats = [
    { 
      title: 'Total Topics', 
      value: topicCount || 0, 
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      title: 'Categories', 
      value: categoryCount || 0, 
      icon: FolderTree,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    { 
      title: 'Course Units', 
      value: courseUnitCount || 0, 
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    { 
      title: 'Semesters', 
      value: semesterCount || 0, 
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
            <a 
              href="/admin/topics" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Manage Topics</span>
            </a>
            <a 
              href="/admin/categories" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <FolderTree className="h-4 w-4" />
              <span>Manage Categories</span>
            </a>
            <a 
              href="/admin/migrate" 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Migrate Data</span>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to use this admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Run the database migration first (if not done)</li>
              <li>Add or edit topics using the Topics page</li>
              <li>Organize topics into categories and course units</li>
              <li>Upload images for topics as needed</li>
              <li>Changes are reflected on the public site immediately</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
