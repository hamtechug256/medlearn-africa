'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileEdit, Search, Plus, Save, Eye, Undo, Redo, Bold, Italic,
  List, ListOrdered, Quote, Code, Image, Link2, Heading1, Heading2
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export default function ContentEditorPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [content, setContent] = useState('')

  const topics = [
    { id: '1', title: 'Cardiovascular System', category: 'Anatomy', status: 'published' },
    { id: '2', title: 'Respiratory System', category: 'Physiology', status: 'published' },
    { id: '3', title: 'Nervous System', category: 'Anatomy', status: 'draft' },
    { id: '4', title: 'Digestive System', category: 'Physiology', status: 'published' },
    { id: '5', title: 'Endocrine System', category: 'Physiology', status: 'published' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Editor</h1>
          <p className="text-muted-foreground">Edit and manage topic content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Topic List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Topics</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search topics..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                    selectedTopic === topic.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.title}</span>
                    <Badge variant={topic.status === 'published' ? 'default' : 'secondary'}>
                      {topic.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{topic.category}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedTopic ? 'Edit: Cardiovascular System' : 'Select a topic to edit'}
                </CardTitle>
                <CardDescription>
                  {selectedTopic ? 'Last saved 5 minutes ago' : 'Choose from the list on the left'}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 pt-4">
              <Button variant="ghost" size="icon" title="Heading 1">
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Heading 2">
                <Heading2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button variant="ghost" size="icon" title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button variant="ghost" size="icon" title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button variant="ghost" size="icon" title="Quote">
                <Quote className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Code">
                <Code className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button variant="ghost" size="icon" title="Insert Image">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Insert Link">
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="write">
              <div className="border-b px-4">
                <TabsList className="h-12">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="write" className="m-0">
                <Textarea
                  placeholder={selectedTopic ? "Start writing..." : "Select a topic to start editing..."}
                  className="min-h-[400px] border-0 rounded-none focus-visible:ring-0 resize-none p-4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!selectedTopic}
                />
              </TabsContent>
              <TabsContent value="preview" className="m-0 p-4 min-h-[400px]">
                <div className="prose prose-sm max-w-none">
                  {content || <p className="text-muted-foreground">Nothing to preview</p>}
                </div>
              </TabsContent>
              <TabsContent value="html" className="m-0 p-4 min-h-[400px]">
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {content ? `<div>${content}</div>` : '<!-- No content -->'}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">457</div>
            <p className="text-sm text-muted-foreground">Total Topics</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">412</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">45</div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">~500K</div>
            <p className="text-sm text-muted-foreground">Total Words</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
