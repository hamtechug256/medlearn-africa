'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, Pencil, Trash2, Loader2, BookOpen } from 'lucide-react'

interface CourseUnit {
  id: string
  semester_id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  keywords: string[]
  semester?: { id: string; name: string; short_name: string }
}

interface Semester {
  id: string
  name: string
  short_name: string
}

export default function AdminCourseUnitsPage() {
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCourseUnit, setSelectedCourseUnit] = useState<CourseUnit | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    semester_id: '',
    icon: 'BookOpen',
    color: '#3b82f6',
    keywords: ''
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [cuRes, semRes] = await Promise.all([
        fetch('/api/admin/course-units'),
        fetch('/api/admin/semesters')
      ])
      
      const cuData = await cuRes.json()
      const semData = await semRes.json()
      
      setCourseUnits(cuData || [])
      setSemesters(semData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = (courseUnit: CourseUnit) => {
    setSelectedCourseUnit(courseUnit)
    setFormData({
      code: courseUnit.code,
      name: courseUnit.name,
      description: courseUnit.description || '',
      semester_id: courseUnit.semester_id || '',
      icon: courseUnit.icon || 'BookOpen',
      color: courseUnit.color || '#3b82f6',
      keywords: (courseUnit.keywords || []).join(', ')
    })
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedCourseUnit(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      semester_id: '',
      icon: 'BookOpen',
      color: '#3b82f6',
      keywords: ''
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const keywords = formData.keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0)
      
      const method = selectedCourseUnit ? 'PUT' : 'POST'
      const body = selectedCourseUnit 
        ? { id: selectedCourseUnit.id, ...formData, keywords }
        : { ...formData, keywords }
      
      const res = await fetch('/api/admin/course-units', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        setEditDialogOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error('Error saving course unit:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCourseUnit) return
    
    setSaving(true)
    try {
      await fetch(`/api/admin/course-units?id=${selectedCourseUnit.id}`, {
        method: 'DELETE'
      })
      setDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error deleting course unit:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Units</h1>
          <p className="text-muted-foreground">
            {courseUnits.length} course units
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course Unit
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : courseUnits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No course units found. Create your first course unit!
            </div>
          ) : (
            <div className="divide-y">
              {courseUnits.map((cu) => (
                <div key={cu.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: (cu.color || '#3b82f6') + '20' }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color: cu.color || '#3b82f6' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{cu.code}</Badge>
                        <h3 className="font-medium">{cu.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {cu.semester && <span>{cu.semester.name}</span>}
                        {cu.keywords && cu.keywords.length > 0 && (
                          <span>• {cu.keywords.length} keywords</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(cu)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedCourseUnit(cu)
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

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCourseUnit ? 'Edit Course Unit' : 'Create Course Unit'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="DND 111"
                />
              </div>
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
            </div>
            
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Course unit name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="anatomy, physiology, body"
              />
              <p className="text-xs text-muted-foreground mt-1">
                These keywords are used to automatically match topics to course units
              </p>
            </div>
            
            <div>
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
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedCourseUnit ? 'Save Changes' : 'Create Course Unit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course Unit</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedCourseUnit?.name}"?</p>
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
