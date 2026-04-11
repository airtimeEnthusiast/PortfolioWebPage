import React from 'react'

export default function Home() {
  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome — Home</h1>
        <p className="text-slate-600">This is the landing page. Add a hero, intro, and links to projects.</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded">Project A — short description</div>
          <div className="p-4 border rounded">Project B — short description</div>
        </div>
      </section>
    </div>
  )
}
