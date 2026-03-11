import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public API - Fetch all course units
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const semesterId = searchParams.get('semester_id')
  
  let query = supabase
    .from('course_units')
    .select(`
      *,
      semester:semesters(id, name, short_name),
      topics_count:topics(count)
    `)
    .order('order')
  
  if (semesterId) {
    query = query.eq('semester_id', semesterId)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
