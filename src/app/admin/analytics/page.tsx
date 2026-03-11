'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3, TrendingUp, TrendingDown, Users, Eye, Clock, MousePointer,
  FileText, Globe, Smartphone, Monitor, Tablet, ArrowUpRight, ArrowDownRight
} from 'lucide-react'

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Page Views',
      value: '24,589',
      change: '+12.5%',
      trend: 'up',
      icon: Eye
    },
    {
      title: 'Unique Visitors',
      value: '8,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Avg. Time on Page',
      value: '4m 32s',
      change: '+15.3%',
      trend: 'up',
      icon: Clock
    },
    {
      title: 'Bounce Rate',
      value: '32.4%',
      change: '-5.1%',
      trend: 'down',
      icon: MousePointer
    },
  ]

  const topPages = [
    { page: '/topics/cardiovascular-system', views: 1245, change: '+12%' },
    { page: '/topics/respiratory-system', views: 987, change: '+8%' },
    { page: '/topics/nervous-system', views: 876, change: '+15%' },
    { page: '/topics/digestive-system', views: 654, change: '+3%' },
    { page: '/topics/endocrine-system', views: 543, change: '+7%' },
  ]

  const topTopics = [
    { name: 'Cardiovascular System', category: 'Anatomy', views: 3421 },
    { name: 'Respiratory System', category: 'Physiology', views: 2876 },
    { name: 'Nervous System', category: 'Anatomy', views: 2543 },
    { name: 'Drug Administration', category: 'Pharmacology', views: 2123 },
    { name: 'Patient Assessment', category: 'Procedures', views: 1987 },
  ]

  const deviceData = [
    { device: 'Desktop', percentage: 65, icon: Monitor },
    { device: 'Mobile', percentage: 28, icon: Smartphone },
    { device: 'Tablet', percentage: 7, icon: Tablet },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Monitor your site's performance and usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Last 7 Days</Button>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{stat.change} from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, i) => (
                <div key={page.page} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.page}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{page.views.toLocaleString()} views</span>
                      <Badge variant="outline" className="text-green-600">{page.change}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Most Viewed Topics</CardTitle>
            <CardDescription>Popular content by views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTopics.map((topic, i) => (
                <div key={topic.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{topic.name}</p>
                    <p className="text-sm text-muted-foreground">{topic.category}</p>
                  </div>
                  <div className="text-sm font-medium">{topic.views.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
          <CardDescription>How users access your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {deviceData.map((item) => (
              <div key={item.device} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.device}</span>
                  </div>
                  <span className="text-lg font-bold">{item.percentage}%</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'Direct', percentage: 45 },
                { source: 'Google Search', percentage: 32 },
                { source: 'Social Media', percentage: 15 },
                { source: 'Referrals', percentage: 8 },
              ].map((item) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.source}</span>
                    <span className="font-medium">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Top countries by visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { country: 'Uganda', visitors: 4521, percentage: 55 },
                { country: 'Kenya', visitors: 1876, percentage: 23 },
                { country: 'Tanzania', visitors: 987, percentage: 12 },
                { country: 'Rwanda', visitors: 543, percentage: 7 },
                { country: 'Other', visitors: 307, percentage: 3 },
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{item.country}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {item.visitors.toLocaleString()} visitors
                    </span>
                    <Badge variant="secondary">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
