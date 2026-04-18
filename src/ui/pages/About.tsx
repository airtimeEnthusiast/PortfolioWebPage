import React, { useEffect, useMemo, useState } from 'react'
import { Bike, Briefcase, Code2, GraduationCap, MapPin, Mountain } from 'lucide-react'
import { fetchResumeProfile } from '@/firebase/client'

type RecordLike = Record<string, any>

type NormalizedEducation = {
  school: string
  degree: string
  location: string
  dates: string
}

type NormalizedExperience = {
  role: string
  company: string
  period: string
  highlights: string[]
}

type NormalizedProfile = {
  name: string
  role: string
  location: string
  summary: string
  email?: string
  links: Array<{ label: string; url: string }>
  education: NormalizedEducation[]
  experience: NormalizedExperience[]
  skills: string[]
  values: string[]
  hobbies: string[]
}

function formatProfileError(error: unknown): string {
  const message = String(error)
  const lower = message.toLowerCase()

  if (lower.includes('missing or insufficient permissions') || lower.includes('permission-denied')) {
    return 'Firestore rules are blocking reads for resume/profile. Allow read access for this document in your Firestore rules.'
  }

  if (lower.includes('client is offline') || lower.includes('code=unavailable')) {
    return 'Could not reach Firestore (offline/unavailable). Check internet access and verify VITE_FIREBASE_* values are set for this build.'
  }

  if (lower.includes('firebase config is missing')) {
    return 'Firebase env is missing in this build. Configure VITE_FIREBASE_* locally and in GitHub Actions secrets for deploys.'
  }

  return message
}

const EMPTY_PROFILE: NormalizedProfile = {
  name: '',
  role: '',
  location: '',
  summary: '',
  links: [],
  education: [],
  experience: [],
  skills: [],
  values: [],
  hobbies: []
}

function asRecord(value: unknown): RecordLike {
  return value && typeof value === 'object' ? (value as RecordLike) : {}
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return ''
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const parsed = toStringValue(value)
    if (parsed) return parsed
  }
  return ''
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object') {
          const obj = item as RecordLike
          return firstNonEmpty(obj.name, obj.label, obj.value, obj.title)
        }
        return ''
      })
      .filter(Boolean)
  }

  const text = toStringValue(value)
  if (!text) return []
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeSkills(value: unknown): string[] {
  if (!value) return []

  if (Array.isArray(value)) {
    return normalizeStringArray(value)
  }

  if (typeof value === 'object') {
    const obj = value as RecordLike
    const flattened = Object.values(obj).flatMap((entry) => normalizeStringArray(entry))
    return Array.from(new Set(flattened.filter(Boolean)))
  }

  return normalizeStringArray(value)
}

function extractSectionItems(raw: RecordLike, sectionName: string): any[] {
  const direct = raw[sectionName]
  if (Array.isArray(direct)) return direct

  const sections = asArray<RecordLike>(raw.sections)
  const match = sections.find((section) => {
    const title = firstNonEmpty(section.title, section.name).toLowerCase()
    return title.includes(sectionName.toLowerCase())
  })

  if (!match) return []
  return asArray(match.items)
}

function normalizeLinks(raw: RecordLike): Array<{ label: string; url: string }> {
  const links: Array<{ label: string; url: string }> = []
  const contact = asRecord(raw.contact)
  const basics = asRecord(raw.basics)

  const direct = asArray<RecordLike>(raw.links)
  direct.forEach((link) => {
    const url = firstNonEmpty(link.url, link.href)
    if (!url) return
    links.push({ label: firstNonEmpty(link.label, link.name, 'Link'), url })
  })

  const profileLinks = asArray<RecordLike>(basics.profiles)
  profileLinks.forEach((profile) => {
    const url = firstNonEmpty(profile.url)
    if (!url) return
    links.push({ label: firstNonEmpty(profile.network, profile.username, 'Profile'), url })
  })

  ;[
    { label: 'Website', value: firstNonEmpty(contact.website, basics.website, raw.website) },
    { label: 'GitHub', value: firstNonEmpty(contact.github, raw.github) },
    { label: 'LinkedIn', value: firstNonEmpty(contact.linkedin, raw.linkedin) }
  ].forEach((item) => {
    if (item.value) links.push({ label: item.label, url: item.value })
  })

  return links.filter((link, index, all) => all.findIndex((x) => x.url === link.url) === index)
}

function normalizeExperience(raw: RecordLike): NormalizedExperience[] {
  const experience = asArray<RecordLike>(raw.experience)
  const work = asArray<RecordLike>(raw.work)
  const sectionExperience = asArray<RecordLike>(extractSectionItems(raw, 'experience'))
  const source = experience.length ? experience : work.length ? work : sectionExperience

  return source
    .map((item) => {
      const role = firstNonEmpty(item.title, item.position, item.role)
      const company = firstNonEmpty(item.company, item.name, item.organization)
      const period = firstNonEmpty(item.dates, item.period, `${firstNonEmpty(item.startDate)}${item.endDate ? ` - ${firstNonEmpty(item.endDate)}` : ''}`)
      const highlights = [
        ...normalizeStringArray(item.highlights),
        ...normalizeStringArray(item.bullets),
        ...normalizeStringArray(item.achievements)
      ]
      const description = toStringValue(item.description)
      if (description) highlights.push(description)

      return {
        role,
        company,
        period,
        highlights: highlights.filter(Boolean)
      }
    })
    .filter((job) => job.role || job.company)
}

function parseLocation(location: unknown): string {
  if (typeof location === 'string') return location.trim()
  if (location && typeof location === 'object') {
    const obj = location as RecordLike
    return [obj.city, obj.region, obj.countryCode].filter(Boolean).join(', ')
  }
  return ''
}

function normalizeRole(raw: RecordLike, experience: NormalizedExperience[]): string {
  const basics = asRecord(raw.basics)
  if (firstNonEmpty(raw.role, raw.Role, raw.title, basics.label)) {
    return firstNonEmpty(raw.role, raw.Role, raw.title, basics.label)
  }

  if (experience.length > 0) {
    const current = experience[0]
    return [current.role, current.company].filter(Boolean).join(' @ ')
  }

  return ''
}

function normalizeValues(raw: RecordLike): string[] {
  const values = normalizeStringArray(raw.values)
  if (values.length) return values

  return normalizeStringArray(raw.strengths)
}

function normalizeEducation(raw: RecordLike): NormalizedEducation[] {
  const arr = asArray<RecordLike>(raw.education)
  return arr
    .map((item) => ({
      school: firstNonEmpty(item.school, item.institution, item.name),
      degree: firstNonEmpty(item.degree, item.studyType, item.title),
      location: parseLocation(item.location),
      dates: firstNonEmpty(item.dates, item.period, `${firstNonEmpty(item.startDate)}${item.endDate ? ` -- ${firstNonEmpty(item.endDate)}` : ''}`)
    }))
    .filter((e) => e.school || e.degree)
}

function normalizeHobbies(raw: RecordLike): string[] {
  const hobbies = normalizeStringArray(raw.hobbies)
  if (hobbies.length) return hobbies

  const interests = asArray<RecordLike>(raw.interests)
  const interestNames = interests.flatMap((interest) => [
    firstNonEmpty(interest.name, interest.title),
    ...normalizeStringArray(interest.keywords)
  ])

  if (interestNames.length) return interestNames.filter(Boolean)
  return normalizeStringArray(raw.interests)
}

function normalizeProfile(raw: unknown): NormalizedProfile {
  const profile = asRecord(raw)
  const basics = asRecord(profile.basics)
  const contact = asRecord(profile.contact)
  const education = asArray<RecordLike>(profile.education)
  const normalizedExperience = normalizeExperience(profile)
  const role = normalizeRole(profile, normalizedExperience)

  const location = firstNonEmpty(
    parseLocation(contact.location),
    parseLocation(basics.location),
    firstNonEmpty(asRecord(education[0]).location),
    parseLocation(profile.location)
  )

  const links = normalizeLinks(profile)
  const skills = normalizeSkills(profile.skills).length
    ? normalizeSkills(profile.skills)
    : normalizeStringArray(
        asArray<RecordLike>(basics.skills).flatMap((s) => [
          s.name,
          ...asArray<string>(s.keywords)
        ])
      )

  const normalized: NormalizedProfile = {
    name: firstNonEmpty(profile.name, basics.name),
    role,
    location,
    summary: firstNonEmpty(profile.summary, profile.objective, basics.summary),
    email: firstNonEmpty(contact.email, basics.email, profile.email) || undefined,
    links,
    education: normalizeEducation(profile),
    experience: normalizedExperience,
    skills,
    values: normalizeValues(profile),
    hobbies: normalizeHobbies(profile)
  }

  return {
    ...EMPTY_PROFILE,
    ...normalized
  }
}

const About: React.FC = () => {
  const [resume, setResume] = useState<RecordLike | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    fetchResumeProfile()
      .then((doc) => {
        if (!mounted) return
        setResume(doc)
      })
      .catch((e: unknown) => {
        if (!mounted) return
        setError(formatProfileError(e))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const profile = useMemo(() => normalizeProfile(resume), [resume])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-200">
        Loading profile…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-6 text-rose-200">
        Error loading profile: {error}
      </div>
    )
  }

  const topExperience = profile.experience.slice(0, 3)

  return (
    <div className="relative max-w-6xl space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(232,121,249,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(103,232,249,0.1),transparent_28%)]" />
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-8 text-slate-100">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-300" />
        <div className="pointer-events-none absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-fuchsia-300/40 to-cyan-300/40" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wider text-cyan-300">About</p>
            {profile.role ? <p className="mt-2 text-lg text-slate-300">{profile.role}</p> : null}
            {profile.location ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-cyan-300" />
                <span>{profile.location}</span>
              </div>
            ) : null}
          </div>
        </div>

        {profile.summary ? (
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-300">{profile.summary}</p>
        ) : (
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400">
            Add `summary` to `resume/profile` to populate this section.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-4 flex items-center gap-2 text-fuchsia-300">
            <Code2 className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-100">What I Do</h2>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            I design and build reliable web experiences with a strong focus on maintainability,
            performance, and product clarity. My approach is iterative: ship clean foundations,
            then refine based on real usage.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <GraduationCap className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-100">Education</h2>
          </div>
          <div className="space-y-3">
            {profile.education.length > 0 ? (
              profile.education.map((edu, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="font-medium text-slate-100">{edu.school}</p>
                  {edu.degree && <p className="mt-1 text-sm text-cyan-300">{edu.degree}</p>}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {edu.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {edu.location}
                      </span>
                    )}
                    {edu.dates && <span>{edu.dates}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Add `education` in `resume/profile` to populate this section.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <Briefcase className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-100">Experience Highlights</h2>
          </div>

          {topExperience.length > 0 ? (
            <div className="space-y-4">
              {topExperience.map((job, index) => (
                <div key={`${job.role}-${job.company}-${index}`} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-slate-100">
                      {job.role}
                      {job.company ? <span className="text-slate-400"> · {job.company}</span> : null}
                    </h3>
                    {job.period && <span className="text-xs text-slate-400">{job.period}</span>}
                  </div>
                  {job.highlights.length > 0 && (
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                      {job.highlights.slice(0, 2).map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Add experience entries to `resume/profile` to populate this section.</p>
          )}
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-4 flex items-center gap-2 text-fuchsia-300">
            <Code2 className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-100">Skills & Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">Add `skills` in `resume/profile` to populate this section.</span>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
          <div className="mb-4 flex items-center gap-2 text-cyan-300">
            <Bike className="h-4 w-4" />
            <h2 className="text-lg font-semibold text-slate-100">Beyond Coding</h2>
          </div>

          <div className="space-y-2 text-sm text-slate-300">
            {profile.hobbies.length > 0 ? (
              profile.hobbies.map((hobby) => (
                <div key={hobby} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                  {hobby.toLowerCase().includes('mountain') ? (
                    <Mountain className="h-4 w-4 text-cyan-300" />
                  ) : (
                    <Bike className="h-4 w-4 text-fuchsia-300" />
                  )}
                  <span>{hobby}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Add `hobbies` (or `interests`) in `resume/profile` to populate this section.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default About
