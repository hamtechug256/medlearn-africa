'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileText, FolderTree, BookOpen, Calendar, Database, Users,
  FileEdit, Image, Tag, BarChart3, Bell, Settings, Activity,
  TrendingUp, Eye, Clock, CheckCircle, AlertTriangle, RefreshCw,
  Shield, Server, HardDrive, Zap, Loader2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalTopics: number
  totalCategories: number
  totalCourseUnits: number
  totalSemesters: number
  totalImages: number
  totalWords: number
  topicsPerSemester: { name: string; count: number }[]
  topicsPerCategory: { name: string; count: number }[]
  recentTopics: { id: string; title: string; semester: string }[]
  dbStatus: {
    connected: boolean
    topicCount: number
    courseUnitCount: number
    semesterCount: number
    categoryCount: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Fetch local data stats
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ step: 'all' })
      })
      await fetchStats()
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Topics',
      value: stats?.totalTopics || 457,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      change: `${stats?.dbStatus?.topicCount || 0} in database`
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 10,
      icon: FolderTree,
      color: 'text-green-600',
      bg: 'bg-green-100',
      change: 'All active'
    },
    {
      title: 'Course Units',
      value: stats?.totalCourseUnits || 24,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      change: `${stats?.totalSemesters || 6} semesters`
    },
    {
      title: 'Images',
      value: stats?.totalImages?.toLocaleString() || '~2,000',
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
    { title: 'Categories', href: '/admin/categories', icon: FolderTree, description: 'Manage categories' },
    { title: 'Semesters', href: '/admin/semesters', icon: Calendar, description: 'Manage semesters' },
  ]

  const dbConnected = stats?.dbStatus?.connected

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Medlearn Africa - Nursing Education Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Sync to DB
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Supabase</span>
              </div>
              <Badge variant="outline" className={dbConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                {dbConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Topics</span>
              </div>
              <span className="text-sm font-medium">{stats?.dbStatus?.topicCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Course Units</span>
              </div>
              <span className="text-sm font-medium">{stats?.dbStatus?.courseUnitCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Semesters</span>
              </div>
              <span className="text-sm font-medium">{stats?.dbStatus?.semesterCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Categories</span>
              </div>
              <span className="text-sm font-medium">{stats?.dbStatus?.categoryCount || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Per Semester & Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topics Per Semester */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Topics per Semester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topicsPerSemester?.map((sem) => (
                <div key={sem.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{sem.name}</span>
                    <span className="font-medium">{sem.count}</span>
                  </div>
                  <Progress 
                    value={(sem.count / (stats?.totalTopics || 457)) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Topics Per Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Topics per Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topicsPerCategory?.slice(0, 8).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-sm">{cat.name}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Topics
          </CardTitle>
          <CardDescription>Latest topics in your content library</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {stats?.recentTopics?.map((topic) => (
              <Link
                key={topic.id}
                href={`/admin/content?id=${topic.id}`}
                className="p-3 rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="font-medium text-sm truncate">{topic.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{topic.semester}</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

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
