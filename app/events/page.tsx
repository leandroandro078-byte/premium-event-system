'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function EventsPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [category, setCategory] = useState('')
  const [capacity, setCapacity] = useState('')
  const [status, setStatus] = useState('Ativo')

  async function createEvent(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const { error } = await supabase
      .from('Eventos')
      .insert([
        {
          title,
          description,
          location,
          event_date: eventDate,
          event_time: eventTime,
          category,
          capacity: Number(capacity),
          status,
        },
      ])

    if (error) {
      alert(error.message)
      return
    }

    alert('Evento criado com sucesso!')

    setTitle('')
    setDescription('')
    setLocation('')
    setEventDate('')
    setEventTime('')
    setCategory('')
    setCapacity('')
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">

      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">

        <h1 className="mb-8 text-4xl font-bold">
          Criar Evento
        </h1>

        <form
          onSubmit={createEvent}
          className="space-y-5"
        >

          <input
            type="text"
            placeholder="Nome do Evento"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <textarea
            placeholder="Descrição"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="h-32 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <input
            type="text"
            placeholder="Local"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <input
            type="date"
            value={eventDate}
            onChange={(e) =>
              setEventDate(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <input
            type="time"
            value={eventTime}
            onChange={(e) =>
              setEventTime(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <input
            type="text"
            placeholder="Categoria"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <input
            type="number"
            placeholder="Capacidade"
            value={capacity}
            onChange={(e) =>
              setCapacity(e.target.value)
            }
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-green-500 py-4 text-lg font-bold text-black"
          >
            Criar Evento
          </button>

        </form>
      </div>
    </main>
  )
}