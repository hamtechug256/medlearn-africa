'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Database, Loader2, CheckCircle, AlertCircle, ArrowRight, Check, X } from 'lucide-react'

interface MigrationStepResult {
  step: string
  success: boolean
  count: number
  error?: string
}

interface MigrationResult {
  success: boolean
  message: string
  results?: MigrationStepResult[]
  counts?: {
    topics: number
    courseUnits: number
    semesters: number
    categories: number
  }
  error?: string
  details?: string
}

export default function MigrationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ step: 'all' })
      })
      
      const data = await res.json()
      
      if (data.error) {
        setError(`${data.error}${data.details ? `: ${data.details}` : ''}`)
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
      description: 'Import 10 category records from existing data'
    },
    {
      step: 'course-units',
      title: 'Migrate Course Units', 
      description: 'Import 24 course unit records from existing data'
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

  const getStepResult = (stepName: string): MigrationStepResult | undefined => {
    return result?.results?.find(r => r.step === stepName)
  }

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
          <br /><br />
          <strong>Important:</strong> The schema uses TEXT IDs and has RLS disabled for migration.
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
            {migrationSteps.map((item, index) => {
              const stepResult = getStepResult(item.step)
              return (
                <div 
                  key={item.step} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    stepResult 
                      ? stepResult.success 
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepResult 
                      ? stepResult.success 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                      : 'bg-muted'
                  }`}>
                    {stepResult ? (
                      stepResult.success ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                    {stepResult && (
                      <div className={`text-sm mt-1 ${stepResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {stepResult.success 
                          ? `${stepResult.count} records migrated` 
                          : `Error: ${stepResult.error || 'Unknown error'}`
                        }
                      </div>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            })}
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
          <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {result.success ? 'Migration Complete!' : 'Migration Issues'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{result.message}</p>
            
            {result.results && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Step Details:</h4>
                <div className="space-y-1 text-sm">
                  {result.results.map((r) => (
                    <div key={r.step} className="flex items-center gap-2">
                      {r.success ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="capitalize">{r.step.replace('-', ' ')}:</span>
                      <span className={r.success ? 'text-green-600' : 'text-red-600'}>
                        {r.count} records
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {result.counts && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.counts.topics}</div>
                  <div className="text-sm text-muted-foreground">Topics</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.counts.courseUnits}</div>
                  <div className="text-sm text-muted-foreground">Course Units</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.counts.semesters}</div>
                  <div className="text-sm text-muted-foreground">Semesters</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.counts.categories}</div>
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
