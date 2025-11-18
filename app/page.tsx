import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
          Tally
        </h1>
        <p className="text-xl text-slate-300 text-center max-w-md">
          Bet with friends. Keep score. Settle up.
        </p>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-8 py-3 text-lg font-semibold text-slate-900 hover:bg-slate-100 transition"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="rounded-lg border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-slate-900 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    </main>
  )
}