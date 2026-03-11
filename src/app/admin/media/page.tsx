'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Image, Upload, Search, Grid, List, Trash2, Download, ExternalLink,
  MoreHorizontal, FolderOpen, File, FileImage, Film, Music
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const mockImages = [
  { id: '1', name: 'heart-anatomy.png', folder: 'anatomy', size: '2.4 MB', date: '2024-01-15', url: '#' },
  { id: '2', name: 'brain-cross-section.jpg', folder: 'anatomy', size: '1.8 MB', date: '2024-01-14', url: '#' },
  { id: '3', name: 'respiratory-system.png', folder: 'physiology', size: '3.1 MB', date: '2024-01-13', url: '#' },
  { id: '4', name: 'cell-structure.png', folder: 'biology', size: '1.2 MB', date: '2024-01-12', url: '#' },
  { id: '5', name: 'medication-chart.jpg', folder: 'pharmacology', size: '890 KB', date: '2024-01-11', url: '#' },
  { id: '6', name: 'nursing-procedure.png', folder: 'procedures', size: '2.0 MB', date: '2024-01-10', url: '#' },
]

const folders = [
  { name: 'All Files', count: 1247 },
  { name: 'anatomy', count: 234 },
  { name: 'physiology', count: 189 },
  { name: 'pharmacology', count: 156 },
  { name: 'procedures', count: 298 },
  { name: 'biology', count: 167 },
  { name: 'other', count: 203 },
]

export default function MediaLibraryPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState('All Files')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage images and files for your topics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FolderOpen className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Drop files here to upload</h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse from your computer
            </p>
            <Input type="file" multiple className="max-w-sm" />
            <p className="text-xs text-muted-foreground mt-2">
              Supported formats: PNG, JPG, GIF, SVG, WEBP (Max 10MB)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Folders Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                  className={`w-full p-3 text-left hover:bg-muted transition-colors flex items-center justify-between ${
                    selectedFolder === folder.name ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{folder.count}</Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Files Grid/List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedFolder}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search files..." className="pl-8 h-9" />
                </div>
                <Button
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setView('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setView('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {view === 'grid' ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mockImages.map((img) => (
                  <div key={img.id} className="group relative border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <Image className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{img.size}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {mockImages.map((img) => (
                  <div key={img.id} className="flex items-center gap-4 p-3 hover:bg-muted transition-colors">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{img.name}</p>
                      <p className="text-sm text-muted-foreground">{img.folder}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">{img.size}</div>
                    <div className="text-sm text-muted-foreground">{img.date}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileImage className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">7</div>
                <p className="text-sm text-muted-foreground">Folders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <File className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">~150 MB</div>
                <p className="text-sm text-muted-foreground">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
