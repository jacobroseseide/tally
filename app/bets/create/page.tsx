'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Friend {
  id: string
  username: string
}

export default function CreateBetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Get game info from URL params
  const gameId = searchParams.get('gameId')
  const homeTeam = searchParams.get('homeTeam')
  const awayTeam = searchParams.get('awayTeam')
  const gameDate = searchParams.get('gameDate')
  const homeTeamLogo = searchParams.get('homeTeamLogo')
  const awayTeamLogo = searchParams.get('awayTeamLogo')

  const [friends, setFriends] = useState<Friend[]>([])
  const [selectedFriend, setSelectedFriend] = useState('')
  const [amount, setAmount] = useState('20')
  const [pick, setPick] = useState<'home' | 'away'>('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    const response = await fetch('/api/friends')
    const data = await response.json()
    setFriends(data.friends || [])
  }

  const handleCreateBet = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!selectedFriend) {
      setError('Please select a friend')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opponentId: selectedFriend,
          gameId,
          gameDate,
          homeTeam,
          awayTeam,
          amount: parseFloat(amount),
          creatorPick: pick,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create bet')
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (!gameId || !homeTeam || !awayTeam) {
    return (
      <main className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Game</h1>
          <Link href="/dashboard" className="text-blue-400 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Create Bet</h1>

      {/* Game Info */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Game</h2>
        <div className="flex items-center justify-center gap-4">
          {awayTeamLogo && (
            <img src={awayTeamLogo} alt={awayTeam || ''} className="w-10 h-10" />
          )}
          <span className="text-white font-medium">{awayTeam}</span>
          <span className="text-slate-400">@</span>
          <span className="text-white font-medium">{homeTeam}</span>
          {homeTeamLogo && (
            <img src={homeTeamLogo} alt={homeTeam || ''} className="w-10 h-10" />
          )}
        </div>
        <p className="text-slate-400 text-sm text-center mt-2">
          {new Date(gameDate || '').toLocaleString()}
        </p>
      </div>

        <form onSubmit={handleCreateBet} className="space-y-6">
          {/* Pick your team */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Who do you think will win?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPick('away')}
                className={`rounded-lg p-4 border-2 transition ${
                  pick === 'away'
                    ? 'border-white bg-white/10 text-white'
                    : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                {awayTeam}
              </button>
              <button
                type="button"
                onClick={() => setPick('home')}
                className={`rounded-lg p-4 border-2 transition ${
                  pick === 'home'
                    ? 'border-white bg-white/10 text-white'
                    : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'
                }`}
              >
                {homeTeam}
              </button>
            </div>
          </div>

          {/* Select friend */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bet against
            </label>
            {friends.length === 0 ? (
              <div className="text-slate-400 text-sm">
                No friends yet.{' '}
                <Link href="/friends" className="text-white hover:underline">
                  Add some friends
                </Link>{' '}
                to start betting!
              </div>
            ) : (
              <select
                value={selectedFriend}
                onChange={(e) => setSelectedFriend(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="">Select a friend...</option>
                {friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Bet amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bet Amount ($)
            </label>
            <div className="flex gap-2 mb-2">
              {[5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    amount === preset.toString()
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              placeholder="Enter custom amount"
            />
            <p className="text-slate-500 text-xs mt-1">Max: $100</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500 px-4 py-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || friends.length === 0}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Bet...' : 'Create Bet'}
          </button>
        </form>
      </div>
    </main>
  )
}