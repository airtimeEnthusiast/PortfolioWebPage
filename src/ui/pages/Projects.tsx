import React, { useEffect, useState } from 'react'
import { Code2, ExternalLink, Github } from 'lucide-react'
import { fetchResumeProfile } from '@/firebase/client'

type ProjectEntry = {
  title: string
  type: string
  dates: string
  tech: string[]
  bullets: string[]
  url: string
}

function parseProjects(raw: Record<string, any> | null): ProjectEntry[] {
  if (!raw?.projects || !Array.isArray(raw.projects)) return []

  return raw.projects
    .map((item: Record<string, any>) => ({
      title: item.title || 'Untitled',
      type: item.type || 'Project',
      dates: item.dates || '',
      tech: Array.isArray(item.tech) ? item.tech : [],
      bullets: Array.isArray(item.bullets) ? item.bullets : [],
      url: item.url || ''
    }))
    .filter((p) => p.title || p.url)
}

const ACCENT = ['text-fuchsia-300', 'text-cyan-300'] as const

export default function Projects() {
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
        Loading projects…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-6 text-rose-200">
        Error loading projects: {error}
      </div>
    )
  }

  const projects = parseProjects(raw)

  return (
    <div className="relative max-w-6xl space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(103,232,249,0.1),transparent_28%)]" />

      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300" />
        <div className="pointer-events-none absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-fuchsia-300/40 to-cyan-300/40" />
        <p className="text-sm uppercase tracking-wider text-cyan-300">Projects</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">What I've built</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          A selection of applications and systems, ranging from academic coursework to personal projects.
        </p>
      </section>

      {/* Project cards */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project, i) => {
            const accent = ACCENT[i % ACCENT.length]
            return (
              <article
                key={project.url || project.title}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-colors hover:border-slate-700"
              >
                {/* Header: icon + title */}
                <div className={`mb-2 flex items-start gap-3`}>
                  <div className={`${accent} mt-1 flex-shrink-0`}>
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-100">{project.title}</h2>
                    <p className="text-sm text-slate-400">
                      {project.type}
                      {project.dates && ` · ${project.dates}`}
                    </p>
                  </div>
                </div>

                {/* Bullets */}
                {project.bullets.length > 0 && (
                  <ul className="mb-4 mt-4 space-y-2 text-sm text-slate-300">
                    {project.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tech stack */}
                {project.tech.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* GitHub link */}
                {project.url && (
                  <div className="mt-auto pt-4">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-fuchsia-500/50 hover:text-fuchsia-300"
                    >
                      <Github className="h-4 w-4" />
                      View on GitHub
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-400">
          Add a <code className="text-fuchsia-300">projects</code> array to{' '}
          <code className="text-cyan-300">resume/profile</code> in Firestore to populate this page.
        </div>
      )}
    </div>
  )
}
