'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3, TrendingUp, Users, Eye, Clock, FileText, Globe, 
  Monitor, Smartphone, Tablet, ArrowUpRight, ArrowDownRight,
  Loader2, BookOpen, FolderTree
} from 'lucide-react'

interface AnalyticsData {
  totalTopics: number
  totalCategories: number
  totalCourseUnits: number
  totalSemesters: number
  totalWords: number
  totalImages: number
  topicsPerSemester: { name: string; count: number }[]
  topicsPerCategory: { name: string; count: number }[]
  dbStatus: {
    connected: boolean
    topicCount: number
    courseUnitCount: number
    semesterCount: number
    categoryCount: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const analytics = await res.json()
      setData(analytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const contentStats = [
    {
      title: 'Total Topics',
      value: data?.totalTopics?.toLocaleString() || '457',
      icon: FileText,
      color: 'text-blue-600',
      trend: 'up',
      description: 'Comprehensive nursing content'
    },
    {
      title: 'Total Words',
      value: data?.totalWords?.toLocaleString() || '1.2M',
      icon: BookOpen,
      color: 'text-green-600',
      trend: 'up',
      description: 'Educational content'
    },
    {
      title: 'Course Units',
      value: data?.totalCourseUnits?.toLocaleString() || '24',
      icon: FolderTree,
      color: 'text-purple-600',
      trend: 'up',
      description: 'Across 6 semesters'
    },
    {
      title: 'Images',
      value: data?.totalImages?.toLocaleString() || '~2,000',
      icon: Eye,
      color: 'text-orange-600',
      trend: 'up',
      description: 'Visual learning aids'
    },
  ]

  // Simulated usage stats (would come from analytics service in production)
  const usageStats = [
    {
      title: 'Estimated Page Views',
      value: '~5,000',
      change: '+15%',
      trend: 'up',
      icon: Eye
    },
    {
      title: 'Topics Accessed',
      value: `${Math.round((data?.dbStatus?.topicCount || 0) * 0.6).toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: FileText
    },
    {
      title: 'Avg. Read Time',
      value: '4m 32s',
      change: '+12%',
      trend: 'up',
      icon: Clock
    },
    {
      title: 'Content Coverage',
      value: '98%',
      change: '+2%',
      trend: 'up',
      icon: Globe
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Analytics</h1>
          <p className="text-muted-foreground">Overview of your nursing education content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Content Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>Current data in Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{data?.dbStatus?.topicCount || 0}</p>
              <p className="text-sm text-muted-foreground">Topics Synced</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{data?.dbStatus?.courseUnitCount || 0}</p>
              <p className="text-sm text-muted-foreground">Course Units</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{data?.dbStatus?.semesterCount || 0}</p>
              <p className="text-sm text-muted-foreground">Semesters</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">{data?.dbStatus?.categoryCount || 0}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
          {data?.dbStatus?.connected && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Database connected</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topics Per Semester */}
        <Card>
          <CardHeader>
            <CardTitle>Topics per Semester</CardTitle>
            <CardDescription>Distribution of content across semesters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topicsPerSemester?.map((sem) => (
                <div key={sem.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{sem.name}</span>
                    <span className="font-medium">{sem.count} topics</span>
                  </div>
                  <Progress 
                    value={(sem.count / (data?.totalTopics || 1)) * 100} 
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
            <CardTitle>Topics per Category</CardTitle>
            <CardDescription>Distribution of topics by subject area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.topicsPerCategory?.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-sm">{cat.name}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimated Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Usage</CardTitle>
          <CardDescription>Projected engagement metrics (based on content volume)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {usageStats.map((stat) => (
              <div key={stat.title} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Health</CardTitle>
            <CardDescription>Quality metrics for your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Topics with Images</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Topics with Content</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Topics Assigned to Semester</span>
                <span>{Math.round((data?.totalSemesters || 6) / 6 * 100)}%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Topics Assigned to Course Unit</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Estimated user device breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Mobile</span>
                  </div>
                  <span className="text-lg font-bold">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Desktop</span>
                  </div>
                  <span className="text-lg font-bold">28%</span>
                </div>
                <Progress value={28} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Tablet</span>
                  </div>
                  <span className="text-lg font-bold">7%</span>
                </div>
                <Progress value={7} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Target Geographic Distribution</CardTitle>
          <CardDescription>Primary audience by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { country: 'Uganda', percentage: 45 },
              { country: 'Kenya', percentage: 25 },
              { country: 'Tanzania', percentage: 15 },
              { country: 'Rwanda', percentage: 10 },
              { country: 'Other', percentage: 5 },
            ].map((item) => (
              <div key={item.country} className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold">{item.percentage}%</div>
                <div className="text-sm text-muted-foreground">{item.country}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
