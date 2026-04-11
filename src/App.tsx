import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/ui/components/Layout'
import Home from '@/pages/Home'
import Projects from '@/pages/Projects'
import Hobbies from '@/pages/Hobbies'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/hobbies" element={<Hobbies />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
