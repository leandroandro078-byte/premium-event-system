"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function DashboardPage() {

  const router = useRouter()

  const [guests, setGuests] =
    useState<any[]>([])

  const [eventName, setEventName] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  // LOAD
  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin-auth"
      )

    if (!auth) {

      router.push("/login")

      return
    }

    const selectedEventName =
      localStorage.getItem(
        "selected-event-name"
      )

    if (selectedEventName) {

      setEventName(
        selectedEventName
      )
    }

    loadGuests()

    // REALTIME
    const channel =
      supabase
        .channel(
          "dashboard-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Convidados",
          },
          () => {

            loadGuests()
          }
        )
        .subscribe()

    return () => {

      supabase.removeChannel(
        channel
      )
    }

  }, [])

  // LOAD GUESTS
  async function loadGuests() {

    try {

      const selectedEventId =
        localStorage.getItem(
          "selected-event-id"
        )

      let query =
        supabase
          .from("Convidados")
          .select("*")

      if (selectedEventId) {

        query =
          query.eq(
            "event_id",
            selectedEventId
          )
      }

      const {
        data,
        error,
      } = await query

      if (error) {

        console.log(error)

        return
      }

      setGuests(data || [])

      setLoading(false)

    } catch (err) {

      console.log(err)
    }
  }

  // STATS
  const totalGuests =
    guests.length

  const checkedIn =
    guests.filter(
      (guest) =>
        guest.checked_in
    ).length

  const vipGuests =
    guests.filter(
      (guest) =>
        guest.ticket_type ===
        "VIP"
    ).length

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando Dashboard...
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-[300px] bg-[#0f0f13] border-r border-zinc-800 p-7 flex flex-col justify-between">

        <div>

          <div>

            <p className="text-green-400 tracking-[8px] text-sm font-bold">
              PREMIUM
            </p>

            <h1 className="text-5xl font-black mt-5 leading-none">
              Events
            </h1>

            <p className="text-zinc-500 mt-4">
              Admin Panel
            </p>

          </div>

          {/* MENU */}
          <div className="space-y-4 mt-16">

            <button
              className="w-full bg-green-500 text-black font-black p-5 rounded-2xl text-left"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                router.push(
                  "/guests"
                )
              }
              className="w-full bg-[#18181b] hover:bg-zinc-800 transition p-5 rounded-2xl text-left font-bold"
            >
              Convidados
            </button>

            <button
              onClick={() =>
                router.push(
                  "/checkin"
                )
              }
              className="w-full bg-[#18181b] hover:bg-zinc-800 transition p-5 rounded-2xl text-left font-bold"
            >
              Check-in
            </button>

            <button
              onClick={() =>
                router.push(
                  "/reports"
                )
              }
              className="w-full bg-[#18181b] hover:bg-zinc-800 transition p-5 rounded-2xl text-left font-bold"
            >
              Relatórios
            </button>

            <button
              onClick={() =>
                router.push(
                  "/events"
                )
              }
              className="w-full bg-[#18181b] hover:bg-zinc-800 transition p-5 rounded-2xl text-left font-bold"
            >
              Eventos
            </button>

          </div>

        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {

            localStorage.removeItem(
              "admin-auth"
            )

            router.push("/login")
          }}
          className="bg-red-500 hover:bg-red-600 transition p-5 rounded-2xl font-black"
        >
          Logout
        </button>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10">

        {/* HEADER */}
        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-7xl font-black">
              Dashboard
            </h1>

            <p className="text-zinc-400 text-2xl mt-5">
              {eventName}
            </p>

          </div>

          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400">
              STATUS
            </p>

            <h2 className="text-green-400 text-4xl font-black mt-3">
              ONLINE
            </h2>

          </div>

        </div>

        {/* CARDS */}
        <div className="grid grid-cols-4 gap-6 mt-16">

          {/* EVENTS */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 text-2xl">
              Eventos
            </p>

            <h2 className="text-8xl font-black mt-8">
              1
            </h2>

          </div>

          {/* GUESTS */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 text-2xl">
              Convidados
            </p>

            <h2 className="text-green-400 text-8xl font-black mt-8">
              {totalGuests}
            </h2>

          </div>

          {/* CHECKINS */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 text-2xl">
              Check-ins
            </p>

            <h2 className="text-blue-400 text-8xl font-black mt-8">
              {checkedIn}
            </h2>

          </div>

          {/* VIP */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 text-2xl">
              VIPs
            </p>

            <h2 className="text-yellow-400 text-8xl font-black mt-8">
              {vipGuests}
            </h2>

          </div>

        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-10 mt-10">

          <h2 className="text-5xl font-black">
            Sistema Operacional
          </h2>

          <div className="grid grid-cols-3 gap-6 mt-10">

            <div className="bg-black border border-zinc-800 rounded-2xl p-8">

              <p className="text-zinc-500">
                API
              </p>

              <h3 className="text-green-400 text-4xl font-black mt-5">
                ONLINE
              </h3>

            </div>

            <div className="bg-black border border-zinc-800 rounded-2xl p-8">

              <p className="text-zinc-500">
                Supabase
              </p>

              <h3 className="text-green-400 text-4xl font-black mt-5">
                REALTIME
              </h3>

            </div>

            <div className="bg-black border border-zinc-800 rounded-2xl p-8">

              <p className="text-zinc-500">
                Vercel
              </p>

              <h3 className="text-green-400 text-4xl font-black mt-5">
                ONLINE
              </h3>

            </div>

          </div>

        </div>

      </main>

    </div>
  )
}