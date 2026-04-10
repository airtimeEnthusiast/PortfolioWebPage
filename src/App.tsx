import React from 'react'
import { Button } from './ui/button'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
      <div className="max-w-2xl p-8">
        <h1 className="text-4xl font-bold mb-4">Hello — Portfolio</h1>
        <p className="mb-6 text-slate-600">This is your scaffolded portfolio. Start editing <code>src/App.tsx</code>.</p>
        <Button>Primary action</Button>
      </div>
    </div>
  )
}
