import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText, FolderTree, BookOpen, Calendar, Database, Users,
  FileEdit, Image, Tag, BarChart3, Bell, Settings, Activity,
  TrendingUp, Eye, Clock, CheckCircle, AlertTriangle, RefreshCw,
  Shield, Server, HardDrive, Zap
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Topics',
      value: '457',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: '+12 this week'
    },
    {
      title: 'Categories',
      value: '10',
      icon: FolderTree,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: 'All active'
    },
    {
      title: 'Course Units',
      value: '24',
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: '6 semesters'
    },
    {
      title: 'Images',
      value: '~2,000',
      icon: Image,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      change: 'Topic images'
    },
  ]

  const quickActions = [
    { title: 'Manage Topics', href: '/admin/topics', icon: FileText, description: 'Add, edit, or delete topics' },
    { title: 'Content Editor', href: '/admin/content', icon: FileEdit, description: 'Edit topic content' },
    { title: 'Media Library', href: '/admin/media', icon: Image, description: 'Manage images and files' },
    { title: 'Data Migration', href: '/admin/migrate', icon: Database, description: 'Sync data to Supabase' },
    { title: 'User Management', href: '/admin/users', icon: Users, description: 'Manage admin users' },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'View site statistics' },
  ]

  const systemStatus = [
    { name: 'Database', status: 'connected', icon: Server },
    { name: 'Storage', status: 'active', icon: HardDrive },
    { name: 'API', status: 'running', icon: Zap },
    { name: 'Cache', status: 'enabled', icon: Activity },
  ]

  const recentActivity = [
    { action: 'Topic updated', item: 'Cardiovascular System', time: '2 min ago', type: 'update' },
    { action: 'New topic added', item: 'Diabetes Management', time: '15 min ago', type: 'create' },
    { action: 'Image uploaded', item: 'heart-anatomy.png', time: '1 hour ago', type: 'upload' },
    { action: 'Category created', item: 'Emergency Care', time: '3 hours ago', type: 'create' },
    { action: 'Migration completed', item: '457 topics synced', time: 'Yesterday', type: 'migration' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your Medlearn Africa overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Database className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
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
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <div className="font-medium group-hover:text-primary">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Storage */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-1 p-1 rounded-full ${
                    activity.type === 'create' ? 'bg-green-100' :
                    activity.type === 'update' ? 'bg-blue-100' :
                    activity.type === 'upload' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'create' && <CheckCircle className="h-3 w-3 text-green-600" />}
                    {activity.type === 'update' && <RefreshCw className="h-3 w-3 text-blue-600" />}
                    {activity.type === 'upload' && <Image className="h-3 w-3 text-purple-600" />}
                    {activity.type === 'migration' && <Database className="h-3 w-3 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{activity.action}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{activity.item}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Topic Images</span>
                <span>~150 MB</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Documents</span>
                <span>~25 MB</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database</span>
                <span>~50 MB</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Used</span>
                <span className="font-medium">~225 MB / 1 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Guide</CardTitle>
          <CardDescription>How to use this admin panel effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium">Setup Database</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Run the SQL schema in Supabase SQL Editor, then use the migration tool to sync your data.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-medium">Manage Content</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Add or edit topics using the Topics page. Organize them into categories and course units.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium">Upload Media</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload images for topics using the Media Library. Images are stored in Supabase Storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
