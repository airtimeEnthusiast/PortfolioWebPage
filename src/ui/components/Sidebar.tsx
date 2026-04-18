import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Briefcase, Star, Menu } from 'lucide-react'
import site from '@/config/site'

const links = [
  { to: '/', label: 'About', icon: <Home className="w-5 h-5" /> },
  { to: '/projects', label: 'Projects', icon: <Briefcase className="w-5 h-5" /> },
  //{ to: '/hobbies', label: 'Hobbies', icon: <Star className="w-5 h-5" /> }
]

export default function Sidebar({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  return (
    // Sidebar: visible on md+. When `collapsed` is true, show icons only (narrow).
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950 py-3 text-slate-200 transition-all duration-150 ${
        collapsed ? 'w-16 md:w-20 px-0 items-center' : 'w-full md:w-64 px-4'
      }`}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-fuchsia-400/0 via-fuchsia-400/30 to-cyan-300/0" />
      <div className={`mb-4 ${collapsed ? 'text-sm' : 'text-xl'} px-0`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'}`}>
          {/* left column matches nav icon column (px-3 + icon + gap ≈ w-11) */}
          <div className={`${collapsed ? 'w-8' : 'w-11'} flex items-center justify-center`}>
            <button
              onClick={onToggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-slate-300 transition-colors hover:bg-slate-900 hover:text-cyan-300"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className={`flex-1 ${collapsed ? 'w-full' : ''}`}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center rounded-md py-2 text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-slate-900 text-fuchsia-300 shadow-[inset_0_0_0_1px_rgba(232,121,249,0.18)]' : 'text-slate-300 hover:bg-slate-900/80 hover:text-cyan-300'}`
            }
          >
            {/* icon column: fixed width to match hamburger column */}
            <div className={`${collapsed ? 'w-8' : 'w-11'} flex items-center justify-center`}>
              <span className="inline-flex h-8 w-8 items-center justify-center text-current">
                {React.cloneElement(l.icon, { className: 'w-5 h-5' })}
              </span>
            </div>
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className={`mt-6 text-xs text-slate-500 ${collapsed ? 'hidden' : ''}`}>© {new Date().getFullYear()}</div>
    </aside>
  )
}
