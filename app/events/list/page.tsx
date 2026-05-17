'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Event = {
  id: string
  title: string
  description: string
  location: string
  event_date: string
  event_time: string
  category: string
  capacity: number
  status: string
}

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('Eventos')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.log(error)
      return
    }

    setEvents(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold">
          Carregando eventos...
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <div className="mb-10 flex items-center justify-between">

        <div>
          <h1 className="text-5xl font-bold">
            Eventos
          </h1>

          <p className="mt-2 text-zinc-400">
            Lista de eventos cadastrados
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >

            <div className="mb-4 flex items-center justify-between">

              <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-bold text-black">
                {event.status}
              </span>

              <span className="text-sm text-zinc-400">
                {event.category}
              </span>

            </div>

            <h2 className="text-3xl font-bold">
              {event.title}
            </h2>

            <p className="mt-4 text-zinc-400">
              {event.description}
            </p>

            <div className="mt-6 space-y-2 text-sm text-zinc-300">

              <p>
                📍 {event.location}
              </p>

              <p>
                📅 {event.event_date}
              </p>

              <p>
                🕒 {event.event_time}
              </p>

              <p>
                👥 {event.capacity} pessoas
              </p>

            </div>

          </div>
        ))}

      </div>
    </main>
  )
}