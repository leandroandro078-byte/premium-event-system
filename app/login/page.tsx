'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      console.log(data)
      console.log(error)

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.log(err)
      setError('Erro ao fazer login')
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

        <h1 className="mb-2 text-center text-4xl font-bold text-white">
          Admin Login
        </h1>

        <p className="mb-8 text-center text-zinc-400">
          Sistema Premium de Eventos
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-500 py-3 font-bold text-black"
          >
            {loading
              ? 'Entrando...'
              : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}