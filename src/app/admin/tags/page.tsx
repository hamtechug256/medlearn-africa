'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import { Tag, Plus, Search, Edit, Trash2, Hash, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  count?: number
}

export default function TagsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await res.json()
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6'
    })
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6'
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = selectedCategory ? 'PUT' : 'POST'
      const body = selectedCategory
        ? { id: selectedCategory.id, ...formData }
        : formData

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setEditDialogOpen(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return
    
    try {
      await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  // Get all colors used by categories
  const categoryColors = categories.map(c => c.color || '#3b82f6')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Categories & Tags</h1>
          <p className="text-muted-foreground">Organize content with categories</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Category Overview</CardTitle>
              <CardDescription>Categories used to organize nursing topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    className="px-3 py-1 text-sm cursor-pointer hover:opacity-80"
                    style={{
                      backgroundColor: (cat.color || '#3b82f6') + '20',
                      color: cat.color || '#3b82f6',
                      borderColor: cat.color || '#3b82f6'
                    }}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Categories Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Categories ({categories.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
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
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No categories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: cat.color || '#3b82f6' }}
                            />
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {cat.description || '-'}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {cat.color || '#3b82f6'}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600"
                              onClick={() => handleDelete(cat)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Category Cloud */}
          <Card>
            <CardHeader>
              <CardTitle>Category Cloud</CardTitle>
              <CardDescription>Visual representation of categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-4 py-8">
                {categories.map((cat, index) => (
                  <span
                    key={cat.id}
                    className="font-medium transition-transform hover:scale-110 cursor-pointer"
                    style={{
                      fontSize: `${14 + (index % 3) * 2}px`,
                      color: cat.color || '#3b82f6'
                    }}
                  >
                    #{cat.name.toLowerCase().replace(/\s+/g, '-')}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory ? 'Update category details' : 'Add a new category for organizing topics'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Category name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
