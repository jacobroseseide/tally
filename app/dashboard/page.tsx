import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import { getUpcomingGames } from '@/lib/espn'
import Link from 'next/link'

export default async function DashboardPage() {
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
    redirect('/login')
  }

  const games = await getUpcomingGames('nba')

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
        <div className="flex gap-4 mb-8">
          <Link
            href="/friends"
            className="rounded-lg bg-slate-800 border border-slate-700 px-6 py-3 text-white hover:bg-slate-700 transition"
          >
            Manage Friends
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Upcoming NBA Games</h2>
          <div className="grid gap-4">
            {games.slice(0, 5).map((game) => (
              <div key={game.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between gap-8">
                  {/* Away Team */}
                  <div className="flex items-center gap-4 flex-1">
                    {game.awayTeamLogo && (
                      <img src={game.awayTeamLogo} alt={game.awayTeam} className="w-8 h-8" />
                    )}
                    <span className="text-white font-medium">{game.awayTeam}</span>
                  </div>
                  
                  <span className="text-slate-400">@</span>
                  
                  {/* Home Team */}
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <span className="text-white font-medium">{game.homeTeam}</span>
                    {game.homeTeamLogo && (
                      <img src={game.homeTeamLogo} alt={game.homeTeam} className="w-8 h-8" />
                    )}
                  </div>

                  {/* Game Info & Bet Button */}
                  <div className="text-right min-w-[200px]">
                    <p className="text-slate-400 text-sm mb-2">
                      {new Date(game.gameDate).toLocaleString()}
                    </p>
                    <Link
                      href={`/bets/create?gameId=${game.id}&homeTeam=${encodeURIComponent(
                        game.homeTeam
                      )}&awayTeam=${encodeURIComponent(game.awayTeam)}&gameDate=${game.gameDate}`}
                      className="inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition"
                    >
                      Bet on this game
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}