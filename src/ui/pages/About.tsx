import React, { useEffect, useState } from 'react'
import { fetchResume } from '../../firebase/client'

type Resume = any

const About: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    fetchResume()
      .then((doc) => {
        if (!mounted) return
        if (!doc) {
          setError('No resume found')
          return
        }
        // support both { data: <resume> } and top-level resume
        setResume((doc as any).data ?? doc)
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading resume…</div>
  if (error) return <div>Error: {error}</div>
  if (!resume) return <div>No resume data</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">About / Resume</h1>
      {resume.name && <h2 className="text-xl font-semibold">{resume.name}</h2>}
      {resume.contact && (
        <div className="mt-3">
          <h3 className="font-medium">Contact</h3>
          <div className="text-sm text-slate-600">{JSON.stringify(resume.contact)}</div>
        </div>
      )}

      {resume.summary && (
        <section className="mt-4">
          <h3 className="font-medium">Summary</h3>
          <p className="text-sm text-slate-700">{resume.summary}</p>
        </section>
      )}

      {Array.isArray(resume.experience) && (
        <section className="mt-4">
          <h3 className="font-medium">Experience</h3>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {resume.experience.map((job: any, i: number) => (
              <li key={i} className="mb-2">
                <div className="font-semibold">{job.title} — {job.company}</div>
                <div className="text-xs text-slate-500">{job.dates}</div>
                {job.description && <div className="text-sm">{job.description}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  )
}

export default About
