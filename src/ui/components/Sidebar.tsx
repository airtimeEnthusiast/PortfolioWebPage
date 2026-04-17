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
      className={`flex flex-col bg-slate-50 border-r border-slate-200 py-3 transition-all duration-150 ${
        collapsed ? 'w-16 md:w-20 px-0 items-center' : 'w-full md:w-64 px-4'
      }`}
    >
      <div className={`mb-4 ${collapsed ? 'text-sm' : 'text-xl'} px-0`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'}`}>
          {/* left column matches nav icon column (px-3 + icon + gap ≈ w-11) */}
          <div className={`${collapsed ? 'w-8' : 'w-11'} flex items-center justify-center`}>
            <button
              onClick={onToggle}
              className="p-0 rounded-md text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center w-8 h-8"
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
              `flex items-center py-2 rounded-md text-sm font-medium ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            {/* icon column: fixed width to match hamburger column */}
            <div className={`${collapsed ? 'w-8' : 'w-11'} flex items-center justify-center`}>
              <span className="inline-flex items-center justify-center w-8 h-8 text-slate-700">
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
