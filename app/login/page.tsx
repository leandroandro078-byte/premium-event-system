"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseAuth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  async function handleLogin() {
    setLoading(true)

    const { data, error } =
      await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // SALVAR SESSÃO
    localStorage.setItem(
      "admin-auth",
      "true"
    )

    console.log(data)

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-[#18181b] border border-zinc-700 rounded-3xl p-10 w-full max-w-md shadow-2xl">
        
        {/* LOGO */}
        <div className="mb-10">
          <p className="text-green-400 tracking-[8px] font-bold">
            PREMIUM EVENTS
          </p>

          <h1 className="text-5xl font-black text-white mt-4">
            Admin Login
          </h1>

          <p className="text-zinc-400 mt-3">
            Sistema Profissional de Gestão de Eventos
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-zinc-400 text-sm">
            EMAIL
          </label>

          <input
            type="email"
            placeholder="admin@premiumevents.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-black border border-zinc-700 rounded-2xl p-4 mt-2 text-white outline-none focus:border-green-500"
          />
        </div>

        {/* PASSWORD */}
        <div className="mt-6">
          <label className="text-zinc-400 text-sm">
            PASSWORD
          </label>

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-black border border-zinc-700 rounded-2xl p-4 mt-2 text-white outline-none focus:border-green-500"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 transition-all rounded-2xl p-4 mt-8 text-black font-black text-xl"
        >
          {loading
            ? "ENTRANDO..."
            : "ENTRAR"}
        </button>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Premium Event System © 2026
          </p>
        </div>
      </div>
    </div>
  )
}