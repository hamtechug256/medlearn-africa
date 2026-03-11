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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tag, Plus, Search, Edit, Trash2, Hash } from 'lucide-react'

interface TagItem {
  id: string
  name: string
  slug: string
  color: string
  count: number
}

const mockTags: TagItem[] = [
  { id: '1', name: 'Anatomy', slug: 'anatomy', color: '#3b82f6', count: 89 },
  { id: '2', name: 'Physiology', slug: 'physiology', color: '#10b981', count: 67 },
  { id: '3', name: 'Pharmacology', slug: 'pharmacology', color: '#f59e0b', count: 45 },
  { id: '4', name: 'Emergency', slug: 'emergency', color: '#ef4444', count: 32 },
  { id: '5', name: 'Pediatrics', slug: 'pediatrics', color: '#8b5cf6', count: 56 },
  { id: '6', name: 'Surgery', slug: 'surgery', color: '#ec4899', count: 41 },
]

export default function TagsPage() {
  const [tags] = useState<TagItem[]>(mockTags)
  const [search, setSearch] = useState('')

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tags & Labels</h1>
          <p className="text-muted-foreground">Organize content with tags and labels</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
              <DialogDescription>Add a new tag to organize your content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tag Name</Label>
                <Input id="name" placeholder="Enter tag name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="auto-generated-slug" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input id="color" type="color" className="w-20" />
                  <Input placeholder="#3b82f6" className="flex-1" />
                </div>
              </div>
              <Button className="w-full">Create Tag</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Tags</CardTitle>
          <CardDescription>Most used tags across all topics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockTags.map((tag) => (
              <Badge
                key={tag.id}
                className="px-3 py-1 text-sm"
                style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag.name}
                <span className="ml-2 opacity-70">({tag.count})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Tags Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tags</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
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
                <TableHead>Tag</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tag.count} topics</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{tag.color}</code>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tag Cloud */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Cloud</CardTitle>
          <CardDescription>Visual representation of tag usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-3 py-8">
            {mockTags.map((tag) => (
              <span
                key={tag.id}
                className="font-medium transition-transform hover:scale-110 cursor-pointer"
                style={{
                  fontSize: `${Math.min(24, 12 + tag.count / 5)}px`,
                  color: tag.color
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
