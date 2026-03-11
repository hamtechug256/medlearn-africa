import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public API - Fetch all topics or single topic
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const semesterId = searchParams.get('semester_id')
  const courseUnitId = searchParams.get('course_unit_id')
  const categoryId = searchParams.get('category_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  // Single topic by slug
  if (slug) {
    const { data, error } = await supabase
      .from('topics')
      .select(`
        *,
        category:categories(*),
        course_unit:course_units(*),
        semester:semesters(*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  }
  
  // List of topics
  let query = supabase
    .from('topics')
    .select(`
      id,
      title,
      slug,
      description,
      word_count,
      images,
      featured_image,
      category:categories(id, name),
      course_unit:course_units(id, name, code),
      semester:semesters(id, name, short_name)
    `, { count: 'exact' })
    .eq('is_published', true)
    .order('title')
    .limit(limit)
  
  if (semesterId) {
    query = query.eq('semester_id', semesterId)
  }
  
  if (courseUnitId) {
    query = query.eq('course_unit_id', courseUnitId)
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }
  
  const { data, error, count } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data, total: count })
}
