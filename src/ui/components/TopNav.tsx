import React from 'react'
import { Github, Linkedin, FileText, Menu } from 'lucide-react'
import site from '@/config/site'

export default function TopNav({ onToggle }: { onToggle?: () => void }) {
  return (
    <header className="w-full border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="text-lg font-semibold hidden md:block">{site.name}</div>
      </div>

      <div className="flex items-center gap-3">
        <a href={site.github ?? '#'} aria-label="GitHub" className="text-slate-600 hover:text-slate-900">
          <Github className="w-5 h-5" />
        </a>
        <a href={site.linkedin ?? '#'} aria-label="LinkedIn" className="text-slate-600 hover:text-slate-900">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="#" aria-label="Resume" className="text-slate-600 hover:text-slate-900">
          <FileText className="w-5 h-5" />
        </a>
      </div>
    </header>
  )
}
