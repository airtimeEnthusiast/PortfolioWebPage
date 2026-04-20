import React from 'react'
import { Github, Linkedin, FileText } from 'lucide-react'
import site from '@/config/site'

export default function TopNav({ onToggle }: { onToggle?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur md:pt-3">
      <div className="flex items-center gap-3">
        <div className="hidden text-lg font-semibold text-slate-100 md:block">{site.name}</div>
      </div>

      <div className="flex items-center gap-3">
        <a href={site.github ?? '#'} aria-label="GitHub" className="text-slate-400 transition-colors hover:text-fuchsia-300">
          <Github className="w-5 h-5" />
        </a>
        <a href={site.linkedin ?? '#'} aria-label="LinkedIn" className="text-slate-400 transition-colors hover:text-cyan-300">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="#" aria-label="Resume" className="text-slate-400 transition-colors hover:text-fuchsia-300">
          <FileText className="w-5 h-5" />
        </a>
      </div>
    </header>
  )
}
