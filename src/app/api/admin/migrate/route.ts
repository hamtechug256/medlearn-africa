import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Migrate existing data to Supabase
export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { step } = body
  
  const dataDir = path.join(process.cwd(), 'data')
  
  try {
    // Step 1: Migrate Semesters
    if (step === 'semesters' || step === 'all') {
      const curriculumPath = path.join(dataDir, 'course-units.json')
      const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'))
      
      for (let i = 0; i < curriculumData.semesters.length; i++) {
        const sem = curriculumData.semesters[i]
        await supabase.from('semesters').upsert({
          id: sem.id,
          name: sem.name,
          short_name: sem.shortName,
          description: sem.description,
          color: sem.color,
          gradient: sem.gradient,
          order: i + 1
        }, { onConflict: 'id' })
      }
    }
    
    // Step 2: Migrate Categories
    if (step === 'categories' || step === 'all') {
      const categoriesPath = path.join(dataDir, 'categories.json')
      const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'))
      
      for (const cat of categoriesData) {
        await supabase.from('categories').upsert({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          icon: cat.icon || 'Folder',
          color: cat.color || '#3b82f6'
        }, { onConflict: 'id' })
      }
    }
    
    // Step 3: Migrate Course Units
    if (step === 'course-units' || step === 'all') {
      const curriculumPath = path.join(dataDir, 'course-units.json')
      const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf-8'))
      
      for (const sem of curriculumData.semesters) {
        for (let i = 0; i < sem.courseUnits.length; i++) {
          const cu = sem.courseUnits[i]
          await supabase.from('course_units').upsert({
            id: cu.id,
            semester_id: sem.id,
            code: cu.code,
            name: cu.name,
            description: cu.description,
            icon: cu.icon,
            color: cu.color,
            keywords: cu.keywords || [],
            order: i + 1
          }, { onConflict: 'id' })
        }
      }
    }
    
    // Step 4: Migrate Topics
    if (step === 'topics' || step === 'all') {
      const topicsIndexPath = path.join(dataDir, 'topics-index.json')
      const topicsData = JSON.parse(fs.readFileSync(topicsIndexPath, 'utf-8'))
      
      // Get course units for keyword matching
      const { data: courseUnits } = await supabase
        .from('course_units')
        .select('id, keywords, name')
      
      const batchSize = 50
      for (let i = 0; i < topicsData.length; i += batchSize) {
        const batch = topicsData.slice(i, i + batchSize)
        
        const topicsToInsert = batch.map((topic: { id: string; title: string; category: string; description: string; wordCount: number; images: string[]; semester: string }) => {
          // Find matching course unit by keyword
          let matchedCourseUnitId: string | null = null
          const topicTitleLower = topic.title.toLowerCase()
          
          if (courseUnits) {
            for (const cu of courseUnits) {
              if (cu.keywords && cu.keywords.length > 0) {
                for (const keyword of cu.keywords) {
                  if (topicTitleLower.includes(keyword.toLowerCase())) {
                    matchedCourseUnitId = cu.id
                    break
                  }
                }
              }
              if (matchedCourseUnitId) break
            }
          }
          
          return {
            id: topic.id,
            title: topic.title,
            slug: topic.id,
            category_id: null, // We'll need to match categories differently
            course_unit_id: matchedCourseUnitId,
            semester_id: topic.semester || null,
            description: topic.description || '',
            word_count: topic.wordCount || 0,
            images: topic.images || [],
            is_published: true
          }
        })
        
        const { error } = await supabase
          .from('topics')
          .upsert(topicsToInsert, { onConflict: 'id' })
        
        if (error) {
          console.error('Error inserting batch:', error)
        }
      }
    }
    
    // Step 5: Migrate Topic Content
    if (step === 'content' || step === 'all') {
      const topicsDir = path.join(dataDir, 'topics')
      const files = fs.readdirSync(topicsDir)
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        
        const filePath = path.join(topicsDir, file)
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        
        if (content.id && content.content) {
          await supabase
            .from('topics')
            .update({ content: content.content })
            .eq('id', content.id.replace('.json', ''))
        }
      }
    }
    
    // Get counts
    const { count: topicCount } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
    
    const { count: courseUnitCount } = await supabase
      .from('course_units')
      .select('*', { count: 'exact', head: true })
    
    const { count: semesterCount } = await supabase
      .from('semesters')
      .select('*', { count: 'exact', head: true })
    
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      message: `Migration complete!`,
      counts: {
        topics: topicCount,
        courseUnits: courseUnitCount,
        semesters: semesterCount,
        categories: categoryCount
      }
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
