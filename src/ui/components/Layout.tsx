import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col">
        <TopNav onToggle={() => setCollapsed((s) => !s)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
