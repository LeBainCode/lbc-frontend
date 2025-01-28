// components/LoginModal.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
        onClose()
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#1F2937] rounded-lg p-8 w-[400px]">
        <h2 className="text-2xl font-bold text-white mb-6">Organization Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 px-3 py-2 bg-gray-800 rounded text-white"
            onChange={e => setCredentials({ ...credentials, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-3 py-2 bg-gray-800 rounded text-white"
            onChange={e => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button 
            type="submit"
            className="w-full bg-[#BF9ACA] text-white py-2 rounded hover:bg-opacity-90"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}