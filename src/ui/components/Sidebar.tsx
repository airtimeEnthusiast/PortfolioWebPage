import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Briefcase, Star, Menu } from 'lucide-react'
import site from '@/config/site'

const links = [
  { to: '/about', label: 'About', icon: <Home className="w-5 h-5" /> },
  { to: '/projects', label: 'Projects', icon: <Briefcase className="w-5 h-5" /> },
  //{ to: '/hobbies', label: 'Hobbies', icon: <Star className="w-5 h-5" /> }
]

export default function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  return (
    // Sidebar: visible on md+. When `collapsed` is true, show icons only (narrow).
    <aside
      className={`hidden md:flex md:flex-col bg-slate-50 border-r border-slate-200 p-4 transition-all duration-150 ${
        collapsed ? 'md:w-20' : 'md:w-64'
      }`}
    >
      <div className={`mb-6 ${collapsed ? 'text-sm' : 'text-xl'} px-0`}>
        <div className="flex items-center">
          {/* left column matches nav icon column (px-3 + icon + gap ≈ w-11) */}
          <div className="w-11 flex items-center justify-center">
            <button
              onClick={onToggle}
              className="p-0 rounded-md text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center w-8 h-8"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {/* name sits in column that lines up with nav labels */}
          {!collapsed && <div className="font-semibold ml-3">{site.name}</div>}
        </div>
      </div>

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
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className={`mt-6 text-xs text-slate-500 ${collapsed ? 'hidden' : ''}`}>© {new Date().getFullYear()}</div>
    </aside>
  )
}
