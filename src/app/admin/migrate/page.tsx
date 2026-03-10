'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Database, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

interface MigrationResult {
  success: boolean
  message: string
  counts?: {
    topics: number
    courseUnits: number
    semesters: number
    categories: number
  }
}

export default function MigrationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'all' })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed')
    } finally {
      setLoading(false)
    }
  }

  const migrationSteps = [
    {
      step: 'semesters',
      title: 'Migrate Semesters',
      description: 'Import 6 semester records from existing data'
    },
    {
      step: 'categories', 
      title: 'Migrate Categories',
      description: 'Import category records from existing data'
    },
    {
      step: 'course-units',
      title: 'Migrate Course Units', 
      description: 'Import course unit records from existing data'
    },
    {
      step: 'topics',
      title: 'Migrate Topics',
      description: 'Import 457 topic records from existing data'
    },
    {
      step: 'content',
      title: 'Migrate Content',
      description: 'Import full content for each topic'
    }
  ]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Data Migration</h1>
        <p className="text-muted-foreground">
          Migrate existing data to Supabase database
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Before You Start</AlertTitle>
        <AlertDescription>
          Make sure you have run the SQL schema in Supabase SQL Editor first. 
          The schema file is located at <code className="bg-muted px-1 rounded">supabase-schema.sql</code>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Steps
          </CardTitle>
          <CardDescription>
            The following data will be migrated from your local JSON files to Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {migrationSteps.map((item, index) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          onClick={runMigration} 
          disabled={loading}
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Run Full Migration
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Migration Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Migration Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{result.message}</p>
            {result.counts && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{result.counts.topics}</div>
                  <div className="text-sm text-muted-foreground">Topics</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{result.counts.courseUnits}</div>
                  <div className="text-sm text-muted-foreground">Course Units</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{result.counts.semesters}</div>
                  <div className="text-sm text-muted-foreground">Semesters</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{result.counts.categories}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
