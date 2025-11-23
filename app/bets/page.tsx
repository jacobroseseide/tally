'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Bet {
  id: string
  game_id: string
  home_team: string
  away_team: string
  game_date: string
  amount: number
  creator_pick: 'home' | 'away'
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  creator: { id: string; username: string }
  opponent: { id: string; username: string }
  winner?: { id: string; username: string }
  created_at: string
}

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all')
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const supabase = createClient()

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
  }

  const fetchBets = async () => {
    setLoading(true)
    const response = await fetch('/api/bets')
    const data = await response.json()
    setBets(data.bets || [])
    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      await fetchBets()
      await getCurrentUser()
    })()
  }, [])

  const handleBetAction = async (betId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/bets/${betId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchBets()
      }
    } catch (error) {
      console.error('Error updating bet:', error)
    }
  }

  const filteredBets = bets.filter((bet) => {
    if (filter === 'all') return true
    return bet.status === filter
  })

  const pendingBets = bets.filter(
    (bet) => bet.status === 'pending' && bet.opponent.id === currentUserId
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto text-white">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">My Bets</h1>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Pending Invitations */}
        {pendingBets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Pending Invitations ({pendingBets.length})
            </h2>
            <div className="space-y-4">
              {pendingBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium mb-2">
                        {bet.creator.username} wants to bet ${bet.amount.toFixed(2)}
                      </p>
                      <p className="text-slate-300 text-sm mb-1">
                        {bet.away_team} @ {bet.home_team}
                      </p>
                      <p className="text-slate-400 text-sm">
                        They picked: {bet.creator_pick === 'home' ? bet.home_team : bet.away_team}
                      </p>
                      <p className="text-slate-400 text-xs mt-2">
                        Game: {new Date(bet.game_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleBetAction(bet.id, 'accept')}
                        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBetAction(bet.id, 'decline')}
                        className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                filter === tab
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* All Bets */}
        <div className="space-y-4">
          {filteredBets.length === 0 ? (
            <p className="text-slate-400">No bets found.</p>
          ) : (
            filteredBets.map((bet) => (
              <div
                key={bet.id}
                className={`rounded-lg p-6 border ${
                  bet.status === 'active'
                    ? 'bg-slate-800 border-slate-700'
                    : bet.status === 'completed'
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium">
                        {bet.creator.id === currentUserId ? 'You' : bet.creator.username}
                      </span>
                      <span className="text-slate-400">vs</span>
                      <span className="text-white font-medium">
                        {bet.opponent.id === currentUserId ? 'You' : bet.opponent.username}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-green-400 font-semibold">
                        ${bet.amount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-1">
                      {bet.away_team} @ {bet.home_team}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {bet.creator.id === currentUserId ? 'You' : bet.creator.username} picked:{' '}
                      {bet.creator_pick === 'home' ? bet.home_team : bet.away_team}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      {new Date(bet.game_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        bet.status === 'active'
                          ? 'bg-blue-500/20 text-blue-400'
                          : bet.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : bet.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {bet.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}