import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)

  // Initialize collapsed based on viewport width so narrow screens start minimized
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCollapsed(window.innerWidth < 768)
    }
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
