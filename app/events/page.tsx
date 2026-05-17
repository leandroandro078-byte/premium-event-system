"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function EventsPage() {

  const router = useRouter()

  const [events, setEvents] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [title, setTitle] =
    useState("")

  const [description, setDescription] =
    useState("")

  const [location, setLocation] =
    useState("")

  const [eventDate, setEventDate] =
    useState("")

  const [bannerUrl, setBannerUrl] =
    useState("")

  // AUTH
  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin-auth"
      )

    if (!auth) {
      router.push("/login")
      return
    }

    loadEvents()

  }, [])

  // LOAD EVENTS
  async function loadEvents() {

    const { data, error } =
      await supabase
        .from("Eventos")
        .select("*")
        .order(
          "event_date",
          {
            ascending: false,
          }
        )

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      setEvents(data)
    }

    setLoading(false)
  }

  // CREATE EVENT
  async function createEvent() {

    if (
      !title ||
      !location ||
      !eventDate
    ) {
      alert(
        "Preencha os campos obrigatórios"
      )
      return
    }

    const { error } =
      await supabase
        .from("Eventos")
        .insert([
          {
            title,
            description,
            location,
            event_date:
              eventDate,
            banner_url:
              bannerUrl,
            status: "ativo",
          },
        ])

    if (error) {

      console.log(error)

      alert(error.message)

      return
    }

    alert(
      "✅ EVENTO CRIADO"
    )

    setTitle("")
    setDescription("")
    setLocation("")
    setEventDate("")
    setBannerUrl("")

    loadEvents()
  }

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando Eventos...
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-5 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <p className="text-green-400 tracking-[8px] font-bold text-sm">
            PREMIUM EVENTS
          </p>

          <h1 className="text-4xl lg:text-6xl font-black mt-4">
            Eventos
          </h1>

          <p className="text-zinc-400 mt-3">
            Gestão Multi Eventos
          </p>

        </div>

        <button
          onClick={() =>
            router.push(
              "/dashboard"
            )
          }
          className="bg-zinc-800 hover:bg-zinc-700 transition px-6 py-4 rounded-2xl w-full lg:w-fit"
        >
          Dashboard
        </button>

      </div>

      {/* FORM */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 lg:p-10 mt-10">

        <h2 className="text-3xl font-black">
          Criar Evento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">

          <input
            type="text"
            placeholder="Nome Evento"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            className="bg-black border border-zinc-700 rounded-2xl p-5"
          />

          <input
            type="text"
            placeholder="Local Evento"
            value={location}
            onChange={(e) =>
              setLocation(
                e.target.value
              )
            }
            className="bg-black border border-zinc-700 rounded-2xl p-5"
          />

          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) =>
              setEventDate(
                e.target.value
              )
            }
            className="bg-black border border-zinc-700 rounded-2xl p-5"
          />

          <input
            type="text"
            placeholder="Banner URL"
            value={bannerUrl}
            onChange={(e) =>
              setBannerUrl(
                e.target.value
              )
            }
            className="bg-black border border-zinc-700 rounded-2xl p-5"
          />

        </div>

        <textarea
          placeholder="Descrição Evento"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="w-full bg-black border border-zinc-700 rounded-2xl p-5 mt-5 h-40"
        />

        <button
          onClick={createEvent}
          className="w-full bg-green-500 hover:bg-green-600 transition rounded-2xl p-5 mt-8 text-black font-black text-xl"
        >
          Criar Evento
        </button>

      </div>

      {/* EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">

        {events.map((event) => (

          <div
            key={event.id}
            className="bg-[#18181b] border border-zinc-800 rounded-3xl overflow-hidden"
          >

            {/* BANNER */}
            {event.banner_url ? (

              <img
                src={event.banner_url}
                alt="Banner"
                className="w-full h-52 object-cover"
              />

            ) : (

              <div className="w-full h-52 bg-zinc-900 flex items-center justify-center">

                <h2 className="text-zinc-600 text-2xl font-black">
                  SEM BANNER
                </h2>

              </div>
            )}

            {/* CONTENT */}
            <div className="p-8">

              <div className="flex items-center justify-between">

                <span className="bg-green-500 text-black px-4 py-2 rounded-xl font-black">
                  {event.status}
                </span>

                <p className="text-zinc-500 text-sm">
                  {
                    new Date(
                      event.event_date
                    ).toLocaleDateString()
                  }
                </p>

              </div>

              <h2 className="text-3xl font-black mt-6">
                {event.title}
              </h2>

              <p className="text-zinc-400 mt-4">
                {event.description}
              </p>

              <div className="mt-6">

                <p className="text-zinc-500">
                  LOCAL
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {event.location}
                </h3>

              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-1 gap-4 mt-8">

                <button
                  onClick={() => {

                    localStorage.setItem(
                      "selected-event-id",
                      event.id
                    )

                    localStorage.setItem(
                      "selected-event-name",
                      event.title
                    )

                    alert(
                      "✅ Evento selecionado"
                    )

                    router.push(
                      "/dashboard"
                    )
                  }}
                  className="bg-green-500 hover:bg-green-600 transition rounded-2xl p-4 font-black text-black"
                >
                  Selecionar Evento
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  )
}