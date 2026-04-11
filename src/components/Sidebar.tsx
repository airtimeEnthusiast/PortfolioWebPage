import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Briefcase, Star } from 'lucide-react'

const links = [
  { to: '/home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { to: '/projects', label: 'Projects', icon: <Briefcase className="w-5 h-5" /> },
  { to: '/hobbies', label: 'Hobbies', icon: <Star className="w-5 h-5" /> }
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-50 border-r border-slate-200 p-4">
      <div className="mb-6 text-xl font-semibold">Your Name</div>
      <nav className="flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {l.icon}
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()}</div>
    </aside>
  )
}
