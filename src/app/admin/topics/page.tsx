'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  Loader2, Image as ImageIcon, X, Upload, MoreHorizontal,
  Download, CheckSquare, Square, Filter, Eye, EyeOff,
  Archive, FolderOpen, FileText, XCircle, CheckCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

  // Selection and batch operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Filter state
  const [filterSemester, setFilterSemester] = useState<string>('')
  const [filterCourseUnit, setFilterCourseUnit] = useState<string>('')
  const [filterPublished, setFilterPublished] = useState<string>('')

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [saving, setSaving] = useState(false)

  // Batch operation state
  const [batchOperation, setBatchOperation] = useState<'delete' | 'assign_semester' | 'assign_course_unit' | 'publish' | 'unpublish'>('publish')
  const [batchValue, setBatchValue] = useState('')

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
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(filterSemester && { semester_id: filterSemester }),
        ...(filterCourseUnit && { course_unit_id: filterCourseUnit }),
        ...(filterPublished && { is_published: filterPublished }),
      })

      const res = await fetch(`/api/admin/topics?${params}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (data.data) {
        setTopics(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }

      // Fetch categories, course units, semesters for dropdowns
      const [catRes, cuRes, semRes] = await Promise.all([
        fetch('/api/admin/categories', { credentials: 'include' }),
        fetch('/api/admin/course-units', { credentials: 'include' }),
        fetch('/api/admin/semesters', { credentials: 'include' })
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
  }, [page, search, filterSemester, filterCourseUnit, filterPublished])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(topics.map(t => t.id)))
    }
    setSelectAll(!selectAll)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    setSelectAll(newSelected.size === topics.length)
  }

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
        credentials: 'include',
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
        method: 'DELETE',
        credentials: 'include'
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

  // Batch operations
  const handleBatchOperation = async () => {
    if (selectedIds.size === 0) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/topics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          operation: batchOperation,
          value: batchValue
        })
      })

      if (res.ok) {
        setBatchDialogOpen(false)
        setSelectedIds(new Set())
        setSelectAll(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Batch operation failed')
      }
    } catch (error) {
      console.error('Error in batch operation:', error)
      alert('Batch operation failed')
    } finally {
      setSaving(false)
    }
  }

  // Export functions
  const exportToJSON = () => {
    const dataToExport = selectedIds.size > 0
      ? topics.filter(t => selectedIds.has(t.id))
      : topics

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `topics-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const dataToExport = selectedIds.size > 0
      ? topics.filter(t => selectedIds.has(t.id))
      : topics

    const headers = ['ID', 'Title', 'Description', 'Semester', 'Course Unit', 'Category', 'Published', 'Word Count', 'Images Count']
    const rows = dataToExport.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.semester?.name || '',
      t.course_unit ? `${t.course_unit.code} - ${t.course_unit.name}` : '',
      t.category?.name || '',
      t.is_published ? 'Yes' : 'No',
      t.word_count || 0,
      t.images?.length || 0
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `topics-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
        credentials: 'include',
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

  const openBatchDialog = (operation: typeof batchOperation) => {
    setBatchOperation(operation)
    setBatchValue('')
    setBatchDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Topics Management</h1>
          <p className="text-muted-foreground">
            {total} total topics {selectedIds.size > 0 && `• ${selectedIds.size} selected`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToJSON}>
                <FileText className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
                {semesters.map((sem) => (
                  <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCourseUnit} onValueChange={setFilterCourseUnit}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Course Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Course Units</SelectItem>
                {courseUnits.map((cu) => (
                  <SelectItem key={cu.id} value={cu.id}>{cu.code} - {cu.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">{selectedIds.size} topics selected</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => openBatchDialog('publish')}>
                  <Eye className="h-4 w-4 mr-1" />
                  Publish
                </Button>
                <Button size="sm" variant="outline" onClick={() => openBatchDialog('unpublish')}>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Unpublish
                </Button>
                <Button size="sm" variant="outline" onClick={() => openBatchDialog('assign_semester')}>
                  <Archive className="h-4 w-4 mr-1" />
                  Set Semester
                </Button>
                <Button size="sm" variant="outline" onClick={() => openBatchDialog('assign_course_unit')}>
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Set Course Unit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => openBatchDialog('delete')}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setSelectedIds(new Set()); setSelectAll(false) }}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {/* Header Row */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 font-medium text-sm">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={toggleSelectAll}
                />
                <div className="flex-1">Topic</div>
                <div className="hidden md:block w-48">Course Unit</div>
                <div className="hidden lg:block w-32">Semester</div>
                <div className="hidden lg:block w-24">Status</div>
                <div className="w-24">Actions</div>
              </div>

              {/* Topic Rows */}
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/50 ${selectedIds.has(topic.id) ? 'bg-primary/5' : ''}`}
                >
                  <Checkbox
                    checked={selectedIds.has(topic.id)}
                    onCheckedChange={() => toggleSelect(topic.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{topic.title}</h3>
                      {topic.images.length > 0 && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {topic.images.length}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {topic.description || 'No description'}
                    </p>
                  </div>
                  <div className="hidden md:block w-48 text-sm text-muted-foreground truncate">
                    {topic.course_unit ? (
                      <span>{topic.course_unit.code} - {topic.course_unit.name}</span>
                    ) : (
                      <span className="text-orange-500">Unassigned</span>
                    )}
                  </div>
                  <div className="hidden lg:block w-32 text-sm text-muted-foreground">
                    {topic.semester?.short_name || '-'}
                  </div>
                  <div className="hidden lg:block w-24">
                    {topic.is_published ? (
                      <Badge className="bg-green-500">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 w-24">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(topic)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/topic/${topic.slug}`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(topic)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedTopic(topic)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      {/* Batch Operation Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {batchOperation === 'delete' && 'Delete Selected Topics'}
              {batchOperation === 'publish' && 'Publish Selected Topics'}
              {batchOperation === 'unpublish' && 'Unpublish Selected Topics'}
              {batchOperation === 'assign_semester' && 'Assign Semester'}
              {batchOperation === 'assign_course_unit' && 'Assign Course Unit'}
            </DialogTitle>
            <DialogDescription>
              This will affect {selectedIds.size} selected topic(s).
            </DialogDescription>
          </DialogHeader>

          {(batchOperation === 'assign_semester' || batchOperation === 'assign_course_unit') && (
            <div className="py-4">
              <Label>
                {batchOperation === 'assign_semester' ? 'Select Semester' : 'Select Course Unit'}
              </Label>
              <Select value={batchValue} onValueChange={setBatchValue}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {batchOperation === 'assign_semester' ? (
                    semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>{sem.name}</SelectItem>
                    ))
                  ) : (
                    courseUnits.map((cu) => (
                      <SelectItem key={cu.id} value={cu.id}>{cu.code} - {cu.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {batchOperation === 'delete' && (
            <Alert variant="destructive">
              <Trash2 className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. All selected topics will be permanently deleted.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={batchOperation === 'delete' ? 'destructive' : 'default'}
              onClick={handleBatchOperation}
              disabled={saving || ((batchOperation === 'assign_semester' || batchOperation === 'assign_course_unit') && !batchValue)}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {batchOperation === 'delete' && 'Delete All'}
              {batchOperation === 'publish' && 'Publish All'}
              {batchOperation === 'unpublish' && 'Unpublish All'}
              {batchOperation === 'assign_semester' && 'Assign Semester'}
              {batchOperation === 'assign_course_unit' && 'Assign Course Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
