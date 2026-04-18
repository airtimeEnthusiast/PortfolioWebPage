import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/ui/components/Layout'
import About from '@/ui/pages/About'
import Projects from '@/ui/pages/Projects'
import Hobbies from '@/ui/pages/Hobbies'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/hobbies" element={<Hobbies />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
