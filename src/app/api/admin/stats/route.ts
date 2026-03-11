import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    
    // Load local JSON data
    const topicsIndex = JSON.parse(fs.readFileSync(path.join(dataDir, 'topics-index.json'), 'utf-8'))
    const categories = JSON.parse(fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf-8'))
    const curriculum = JSON.parse(fs.readFileSync(path.join(dataDir, 'course-units.json'), 'utf-8'))

    // Calculate stats from local data
    const totalTopics = topicsIndex.length
    const totalCategories = categories.length
    const totalSemesters = curriculum.semesters.length
    const totalCourseUnits = curriculum.semesters.reduce((acc: number, sem: { courseUnits: string | any[] }) => acc + sem.courseUnits.length, 0)
    
    // Count total images
    const totalImages = topicsIndex.reduce((acc: number, t: { images: string | any[] }) => acc + (t.images?.length || 0), 0)
    
    // Count total words
    const totalWords = topicsIndex.reduce((acc: number, t: { wordCount: number }) => acc + (t.wordCount || 0), 0)

    // Topics per semester
    const topicsPerSemester = curriculum.semesters.map((sem: { id: string; name: string }) => ({
      name: sem.name,
      count: topicsIndex.filter((t: { semester: string }) => t.semester === sem.id).length
    }))

    // Topics per category
    const categoryCounts: Record<string, number> = {}
    topicsIndex.forEach((t: { category: string }) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1
    })
    const topicsPerCategory = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // Recent topics (last 10)
    const recentTopics = topicsIndex.slice(0, 10).map((t: { id: string; title: string; semester: string }) => ({
      id: t.id,
      title: t.title,
      semester: curriculum.semesters.find((s: { id: string }) => s.id === t.semester)?.name || t.semester
    }))

    // Check database status
    let dbStatus = {
      connected: false,
      topicCount: 0,
      courseUnitCount: 0,
      semesterCount: 0,
      categoryCount: 0
    }

    try {
      const supabase = await createClient()
      
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

      dbStatus = {
        connected: true,
        topicCount: topicCount || 0,
        courseUnitCount: courseUnitCount || 0,
        semesterCount: semesterCount || 0,
        categoryCount: categoryCount || 0
      }
    } catch (e) {
      // Database not connected or tables don't exist
      console.log('Database not available')
    }

    return NextResponse.json({
      totalTopics,
      totalCategories,
      totalSemesters,
      totalCourseUnits,
      totalImages,
      totalWords,
      topicsPerSemester,
      topicsPerCategory,
      recentTopics,
      dbStatus
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
