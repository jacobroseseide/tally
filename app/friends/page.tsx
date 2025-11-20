'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

interface Friend {
  id: string
  username: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    const response = await fetch('/api/friends')
    const data = await response.json()
    setFriends(data.friends || [])
  }

  const searchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    const response = await fetch(`/api/users?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    setSearchResults(data.users || [])
  }

  const addFriend = async (friendId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      })

      if (response.ok) {
        fetchFriends()
        setSearchQuery('')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error adding friend:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Friends</h1>
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Search for users */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Add Friends</h2>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchUsers(e.target.value)
            }}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700"
                >
                  <span className="text-white">{user.username}</span>
                  <button
                    onClick={() => addFriend(user.id)}
                    disabled={loading || friends.some(f => f.id === user.id)}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {friends.some(f => f.id === user.id) ? 'Already Friends' : 'Add Friend'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friends list */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Your Friends</h2>
          {friends.length === 0 ? (
            <p className="text-slate-400">No friends yet. Add some above!</p>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between bg-slate-800 rounded-lg p-4 border border-slate-700"
                >
                  <span className="text-white font-medium">{friend.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}