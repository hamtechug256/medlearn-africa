'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Image as ImageIcon,
  X,
  Upload
} from 'lucide-react'

interface Topic {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  word_count: number
  images: string[]
  featured_image: string | null
  is_published: boolean
  category_id: string | null
  course_unit_id: string | null
  semester_id: string | null
  category?: { id: string; name: string } | null
  course_unit?: { id: string; name: string; code: string } | null
  semester?: { id: string; name: string; short_name: string } | null
}

interface Category {
  id: string
  name: string
}

interface CourseUnit {
  id: string
  name: string
  code: string
}

interface Semester {
  id: string
  name: string
  short_name: string
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    course_unit_id: '',
    semester_id: '',
    is_published: true,
    images: [] as string[]
  })
  
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch topics
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      })
      
      const res = await fetch(`/api/admin/topics?${params}`)
      const data = await res.json()
      
      if (data.data) {
        setTopics(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
      
      // Fetch categories, course units, semesters for dropdowns
      const [catRes, cuRes, semRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/course-units'),
        fetch('/api/admin/semesters')
      ])
      
      const catData = await catRes.json()
      const cuData = await cuRes.json()
      const semData = await semRes.json()
      
      setCategories(catData || [])
      setCourseUnits(cuData || [])
      setSemesters(semData || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = (topic: Topic) => {
    setSelectedTopic(topic)
    setFormData({
      title: topic.title,
      description: topic.description || '',
      content: topic.content || '',
      category_id: topic.category_id || '',
      course_unit_id: topic.course_unit_id || '',
      semester_id: topic.semester_id || '',
      is_published: topic.is_published,
      images: topic.images || []
    })
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedTopic(null)
    setFormData({
      title: '',
      description: '',
      content: '',
      category_id: '',
      course_unit_id: '',
      semester_id: '',
      is_published: true,
      images: []
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = '/api/admin/topics'
      const method = selectedTopic ? 'PUT' : 'POST'
      const body = selectedTopic 
        ? { id: selectedTopic.id, ...formData }
        : formData
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        setEditDialogOpen(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save topic')
      }
    } catch (error) {
      console.error('Error saving topic:', error)
      alert('Failed to save topic')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTopic) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/topics?id=${selectedTopic.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setDeleteDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('folder', 'topics')
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      const data = await res.json()
      if (data.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url]
        }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground">
            {total} total topics
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Topics Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No topics found. Create your first topic!
            </div>
          ) : (
            <div className="divide-y">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{topic.title}</h3>
                      {topic.images.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {topic.images.length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {topic.course_unit && (
                        <span>{topic.course_unit.code} - {topic.course_unit.name}</span>
                      )}
                      {topic.semester && (
                        <span>• {topic.semester.short_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(topic)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedTopic(topic)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTopic ? 'Edit Topic' : 'Create Topic'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Topic title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="content">Content (HTML supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Full topic content"
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Semester</Label>
                <Select 
                  value={formData.semester_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, semester_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Course Unit</Label>
                <Select 
                  value={formData.course_unit_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, course_unit_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseUnits.map((cu) => (
                      <SelectItem key={cu.id} value={cu.id}>{cu.code} - {cu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Images */}
            <div>
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img 
                      src={img} 
                      alt="" 
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                  />
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedTopic ? 'Save Changes' : 'Create Topic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedTopic?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
