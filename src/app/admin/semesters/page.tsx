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
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, Calendar } from 'lucide-react'

interface Semester {
  id: string
  name: string
  short_name: string
  description: string | null
  color: string | null
  gradient: string | null
  order: number
}

export default function AdminSemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    description: '',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-violet-600'
  })

  const fetchSemesters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/semesters')
      const data = await res.json()
      setSemesters(data || [])
    } catch (error) {
      console.error('Error fetching semesters:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSemesters()
  }, [fetchSemesters])

  const handleEdit = (semester: Semester) => {
    setSelectedSemester(semester)
    setFormData({
      name: semester.name,
      short_name: semester.short_name,
      description: semester.description || '',
      color: semester.color || '#6366f1',
      gradient: semester.gradient || 'from-indigo-500 to-violet-600'
    })
    setEditDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedSemester(null)
    setFormData({
      name: '',
      short_name: '',
      description: '',
      color: '#6366f1',
      gradient: 'from-indigo-500 to-violet-600'
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = selectedSemester ? 'PUT' : 'POST'
      const body = selectedSemester 
        ? { id: selectedSemester.id, ...formData }
        : formData
      
      const res = await fetch('/api/admin/semesters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        setEditDialogOpen(false)
        fetchSemesters()
      }
    } catch (error) {
      console.error('Error saving semester:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedSemester) return
    
    setSaving(true)
    try {
      await fetch(`/api/admin/semesters?id=${selectedSemester.id}`, {
        method: 'DELETE'
      })
      setDeleteDialogOpen(false)
      fetchSemesters()
    } catch (error) {
      console.error('Error deleting semester:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Semesters</h1>
          <p className="text-muted-foreground">
            {semesters.length} semesters
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Semester
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : semesters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No semesters found. Create your first semester!
            </div>
          ) : (
            <div className="divide-y">
              {semesters.map((sem) => (
                <div key={sem.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: (sem.color || '#6366f1') + '20' }}
                    >
                      <Calendar className="h-5 w-5" style={{ color: sem.color || '#6366f1' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{sem.short_name}</Badge>
                        <h3 className="font-medium">{sem.name}</h3>
                      </div>
                      {sem.description && (
                        <p className="text-sm text-muted-foreground">{sem.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(sem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedSemester(sem)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSemester ? 'Edit Semester' : 'Create Semester'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Year 1 Semester 1"
                />
              </div>
              <div>
                <Label htmlFor="short_name">Short Name</Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_name: e.target.value }))}
                  placeholder="Y1S1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description"
              />
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
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="gradient">Gradient (Tailwind classes)</Label>
              <Input
                id="gradient"
                value={formData.gradient}
                onChange={(e) => setFormData(prev => ({ ...prev, gradient: e.target.value }))}
                placeholder="from-indigo-500 to-violet-600"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedSemester ? 'Save Changes' : 'Create Semester'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Semester</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedSemester?.name}"?</p>
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
