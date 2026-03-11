import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public API - Fetch all semesters
export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('semesters')
    .select(`
      *,
      course_units:course_units(id, code, name),
      topics_count:topics(count)
    `)
    .order('order')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
