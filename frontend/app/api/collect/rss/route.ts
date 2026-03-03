import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'

export async function POST() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase.functions.invoke('collect-rss', {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, count: 0 },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, count: data?.count || 0, data })
  } catch (error) {
    console.error('RSS collection error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger RSS collection', count: 0 },
      { status: 500 }
    )
  }
}
