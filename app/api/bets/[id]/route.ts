import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// PATCH: Update bet status (accept/decline)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params
  const { action } = await request.json()

  // Verify user is the opponent
  const { data: bet } = await supabase
    .from('bets')
    .select('*')
    .eq('id', id)
    .single()

  if (!bet || bet.opponent_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const newStatus = action === 'accept' ? 'active' : 'cancelled'

  const { data: updatedBet, error } = await supabase
    .from('bets')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If accepted, create settlement record
  if (action === 'accept') {
    await supabase.from('settlements').insert({ bet_id: id })
  }

  return NextResponse.json({ bet: updatedBet })
}