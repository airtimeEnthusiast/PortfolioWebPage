import React, { useEffect, useState } from 'react'
import {
  ExternalLink,
  Gamepad2,
  Tv2,
  UtensilsCrossed,
  Bike,
  RollerCoaster,
  Sparkles,
} from 'lucide-react'
import { fetchResumeProfile } from '@/firebase/client'

type HobbyLink = { label: string; url: string }
type HobbyEntry = { name: string; links: HobbyLink[] }

// Map hobby names (lowercase) to a Lucide icon
function hobbyIcon(name: string): React.ReactNode {
  const n = name.toLowerCase()
  if (n.includes('cook') || n.includes('food')) return <UtensilsCrossed className="h-5 w-5" />
  if (n.includes('gaming') || n.includes('steam')) return <Gamepad2 className="h-5 w-5" />
  if (n.includes('strava') || n.includes('cycling') || n.includes('bike')) return <Bike className="h-5 w-5" />
  if (n.includes('youtube') || n.includes('video')) return <Tv2 className="h-5 w-5" />
  if (n.includes('coaster') || n.includes('roller')) return <RollerCoaster className="h-5 w-5" />
  return <Sparkles className="h-5 w-5" />
}

// Accent colour cycles: fuchsia → cyan → fuchsia …
const ACCENT = ['text-fuchsia-300', 'text-cyan-300'] as const

function parseHobbies(raw: Record<string, any> | null): HobbyEntry[] {
  if (!raw) return []

  // Support both "Hobbies" and "hobbies" keys
  const block = raw['Hobbies'] ?? raw['hobbies']
  if (!block || typeof block !== 'object' || Array.isArray(block)) return []

  return Object.entries(block as Record<string, unknown>).map(([name, value]) => {
    const links: HobbyLink[] = []

    if (typeof value === 'string') {
      // single URL — use the hobby name as the label
      links.push({ label: name, url: value })
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // multiple sub-links: { "Label": "url", … }
      Object.entries(value as Record<string, unknown>).forEach(([label, url]) => {
        if (typeof url === 'string') links.push({ label, url })
      })
    }

    return { name, links }
  })
}

export default function Hobbies() {
  const [raw, setRaw] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetchResumeProfile()
      .then((doc) => { if (mounted) setRaw(doc) })
      .catch((e: unknown) => { if (mounted) setError(String(e)) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-200">
        Loading hobbies…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-6 text-rose-200">
        Error loading hobbies: {error}
      </div>
    )
  }

  const hobbies = parseHobbies(raw)

  return (
    <div className="relative max-w-6xl space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(103,232,249,0.1),transparent_28%)]" />

      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300" />
        <div className="pointer-events-none absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-fuchsia-300/40 to-cyan-300/40" />
        <p className="text-sm uppercase tracking-wider text-cyan-300">Hobbies</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Beyond the keyboard</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Things I do when I'm afk.
        </p>
      </section>

      {/* Hobby cards */}
      {hobbies.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hobbies.map((hobby, i) => {
            const accent = ACCENT[i % ACCENT.length]
            return (
              <article
                key={hobby.name}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-colors hover:border-slate-700"
              >
                {/* Card header */}
                <div className={`mb-4 flex items-center gap-2 ${accent}`}>
                  {hobbyIcon(hobby.name)}
                  <h2 className="text-lg font-semibold text-slate-100">{hobby.name}</h2>
                </div>

                {/* Links */}
                {hobby.links.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {hobby.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200 transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-300"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-400">
          Add a <code className="text-fuchsia-300">Hobbies</code> object to{' '}
          <code className="text-cyan-300">resume/profile</code> in Firestore to populate this page.
        </div>
      )}
    </div>
  )
}
