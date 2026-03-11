'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bell, BellRing, Check, Trash2, Settings, Database,
  AlertTriangle, Info, CheckCircle, Clock, FileText,
  RefreshCw, Loader2
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success'
  time: string
  read: boolean
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dbStatus, setDbStatus] = useState({ connected: false, topicCount: 0 })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      
      setDbStatus({
        connected: data?.dbStatus?.connected || false,
        topicCount: data?.dbStatus?.topicCount || 0
      })

      // Generate notifications based on actual system state
      const notifs: Notification[] = []

      if (!data?.dbStatus?.connected) {
        notifs.push({
          id: '1',
          title: 'Database Not Connected',
          message: 'Please run the SQL schema in Supabase and perform a migration to sync your data.',
          type: 'warning',
          time: 'Just now',
          read: false
        })
      } else if (data?.dbStatus?.topicCount === 0) {
        notifs.push({
          id: '2',
          title: 'No Data in Database',
          message: 'Database is connected but contains no topics. Run the migration to sync 457 topics.',
          type: 'warning',
          time: 'Just now',
          read: false
        })
      } else {
        notifs.push({
          id: '3',
          title: 'Database Connected',
          message: `Successfully synced ${data.dbStatus.topicCount} topics to Supabase.`,
          type: 'success',
          time: 'Recently',
          read: false
        })
      }

      // Add content status notifications
      if (data?.totalTopics > 0) {
        notifs.push({
          id: '4',
          title: 'Content Available',
          message: `${data.totalTopics} topics ready across ${data.totalSemesters} semesters.`,
          type: 'info',
          time: 'System',
          read: true
        })
      }

      setNotifications(notifs)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ step: 'all' })
      })
      
      if (res.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Database
          </Button>
        </div>
      </div>

      {/* Database Status Alert */}
      {!dbStatus.connected && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Action Required</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Run the SQL schema in Supabase SQL Editor, then click "Sync Database" above to migrate your content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              System Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 flex gap-4 ${!notification.read ? 'bg-muted/50' : ''}`}
                  >
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className="bg-blue-500 text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Settings</CardTitle>
            <CardDescription>Manage system preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <Label>Auto-sync enabled</Label>
                </div>
                <Switch defaultChecked={false} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label>Content alerts</Label>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label>System alerts</Label>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-4">Database Status</h4>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant={dbStatus.connected ? "default" : "secondary"} className={dbStatus.connected ? "bg-green-500" : ""}>
                    {dbStatus.connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                {dbStatus.connected && (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm">Topics synced</span>
                    <span className="font-medium">{dbStatus.topicCount}</span>
                  </div>
                )}
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={() => window.open('/admin/migrate', '_self')}>
              <Database className="h-4 w-4 mr-2" />
              Go to Migration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
