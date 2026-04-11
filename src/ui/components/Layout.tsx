import React from 'react'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
