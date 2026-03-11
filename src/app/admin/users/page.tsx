'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Users, UserPlus, Search, Shield, Edit, Trash2, Key, AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

// Default admin user (from admin-auth.ts)
const defaultAdmin = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@medlearnafrica.com',
  role: 'super_admin' as const,
  status: 'active' as const,
  lastLogin: new Date().toLocaleString(),
  createdAt: '2024-01-01'
}

export default function UsersPage() {
  const [users] = useState([defaultAdmin])
  const [search, setSearch] = useState('')
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof defaultAdmin | null>(null)

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadge = (role: typeof defaultAdmin.role) => {
    const variants = {
      super_admin: 'bg-red-100 text-red-700 border-red-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      editor: 'bg-green-100 text-green-700 border-green-200',
      viewer: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return (
      <Badge variant="outline" className={variants[role]}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getStatusBadge = (status: typeof defaultAdmin.status) => {
    return status === 'active'
      ? <Badge className="bg-green-500">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="text-muted-foreground">Manage administrator access to the system</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Add a new administrator with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select id="role" className="w-full border rounded-md p-2 bg-background">
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <Button className="w-full">Create User</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current User Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">A</span>
            </div>
            <div>
              <p className="font-medium">You are logged in as <strong>{defaultAdmin.username}</strong></p>
              <p className="text-sm text-muted-foreground">
                Default password: <code className="bg-muted px-1 rounded">medlearn2024</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Admin Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setResetPasswordDialog(true); }}>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>Overview of what each role can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Super Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full system access</li>
                <li>• Manage all users</li>
                <li>• Database operations</li>
                <li>• System settings</li>
                <li>• Content management</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage content</li>
                <li>• Edit topics & categories</li>
                <li>• Upload media</li>
                <li>• View analytics</li>
                <li>• Limited settings</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Editor</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create/edit topics</li>
                <li>• Upload images</li>
                <li>• Edit content</li>
                <li>• Limited settings</li>
                <li>• No user management</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Viewer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View all content</li>
                <li>• Read-only access</li>
                <li>• Export data</li>
                <li>• No edit rights</li>
                <li>• No user management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Admin Password</DialogTitle>
            <DialogDescription>
              Change the password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialog(false)}>
              Cancel
            </Button>
            <Button>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
