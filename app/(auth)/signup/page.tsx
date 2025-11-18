'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
  
    try {
      // Create auth user (profile created automatically via trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
  
      if (authError) throw authError
  
      // Update username if they provided one different from email
      if (authData.user && username) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', authData.user.id)
  
        if (updateError) console.error('Username update error:', updateError)
      }
  
      // Sign in immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
  
      if (signInError) throw signInError
  
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Full error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-slate-300">Join Tally and start betting with friends</p>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-400 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500 px-4 py-3 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

