import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const source = searchParams.get('source')
    const status = searchParams.get('status') || 'published'
    const search = searchParams.get('search')

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('published_at', { ascending: false, nullsFirst: false })

    if (source && source !== 'all') {
      query = query.eq('source', source)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Articles query error:', error)
      return NextResponse.json(
        { error: error.message, articles: [], total: 0 },
        { status: 400 }
      )
    }

    return NextResponse.json({ articles: data || [], total: count })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', articles: [], total: 0 },
      { status: 500 }
    )
  }
}
