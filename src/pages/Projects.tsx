import React from 'react'

export default function Projects() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Projects</h1>
      <p className="text-slate-600 mb-6">A showcase of projects.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded">
            <h3 className="font-semibold">Project {i + 1}</h3>
            <p className="text-sm text-slate-600">Short description of the project.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
