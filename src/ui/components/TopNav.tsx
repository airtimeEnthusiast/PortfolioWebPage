import React from 'react'
import { Github, Linkedin, FileText } from 'lucide-react'

export default function TopNav() {
  return (
    <header className="w-full border-b border-slate-200 bg-white px-4 py-3 flex items-center justify-end gap-3">
      <a href="#" aria-label="GitHub" className="text-slate-600 hover:text-slate-900">
        <Github className="w-5 h-5" />
      </a>
      <a href="#" aria-label="LinkedIn" className="text-slate-600 hover:text-slate-900">
        <Linkedin className="w-5 h-5" />
      </a>
      <a href="#" aria-label="Resume" className="text-slate-600 hover:text-slate-900">
        <FileText className="w-5 h-5" />
      </a>
    </header>
  )
}
