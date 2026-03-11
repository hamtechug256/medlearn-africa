import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Public API - Fetch all categories
export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
