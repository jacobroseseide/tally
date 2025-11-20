import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch user's friends
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get accepted friendships
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select(`
      id,
      friend:friend_id (id, username)
    `)
    .eq('user_id', user.id)
    .eq('status', 'accepted')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ friends: friendships?.map(f => f.friend) || [] })
}

// POST: Send friend request
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { friendId } = await request.json()

  // Create friendship (both directions for easier querying)
  const { error: error1 } = await supabase
    .from('friendships')
    .insert({ user_id: user.id, friend_id: friendId, status: 'accepted' })

  const { error: error2 } = await supabase
    .from('friendships')
    .insert({ user_id: friendId, friend_id: user.id, status: 'accepted' })

  if (error1 || error2) {
    return NextResponse.json(
      { error: error1?.message || error2?.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}