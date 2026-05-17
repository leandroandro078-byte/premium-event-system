"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { supabase } from "@/lib/supabase"

export default function ReportsPage() {

  const router = useRouter()

  const [guests, setGuests] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [selectedEventName, setSelectedEventName] =
    useState(
      "PREMIUM EVENT REPORT"
    )

  // LOAD DATA
  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin-auth"
      )

    if (!auth) {

      router.push("/login")

      return
    }

    const eventName =
      localStorage.getItem(
        "selected-event-name"
      )

    if (eventName) {

      setSelectedEventName(
        eventName
      )
    }

    loadGuests()

  }, [])

  // LOAD GUESTS
  async function loadGuests() {

    try {

      // EVENTO ATIVO
      const selectedEventId =
        localStorage.getItem(
          "selected-event-id"
        )

      // QUERY
      let query =
        supabase
          .from("Convidados")
          .select("*")

      // FILTER EVENT
      if (selectedEventId) {

        query =
          query.eq(
            "event_id",
            selectedEventId
          )
      }

      // EXECUTE
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

  // EXPORT PDF
  function exportPDF() {

    const doc =
      new jsPDF()

    // TITLE
    doc.setFontSize(36)

    doc.text(
      selectedEventName,
      14,
      30
    )

    // TOTAL
    doc.setFontSize(18)

    doc.text(
      `Total Convidados: ${guests.length}`,
      14,
      55
    )

    // TABLE
    autoTable(doc, {

      startY: 75,

      head: [[
        "Nome",
        "Tipo",
        "Status",
        "Evento",
      ]],

      body: guests.map(
        (guest) => [

          guest.full_name,

          guest.ticket_type,

          guest.status,

          guest.event_name,
        ]
      ),

      styles: {
        fontSize: 14,
      },

      headStyles: {
        fillColor: [52, 128, 185],
      },
    })

    // SAVE
    doc.save(
      `${selectedEventName}-report.pdf`
    )
  }

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando Relatórios...
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
            Relatórios
          </h1>

          <p className="text-zinc-400 mt-3">
            Analytics e Exportações
          </p>

        </div>

        <div className="flex flex-col lg:flex-row gap-4">

          {/* DASHBOARD */}
          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="bg-zinc-800 hover:bg-zinc-700 transition rounded-2xl px-8 py-5 font-bold"
          >
            ← Dashboard
          </button>

          {/* EXPORT */}
          <button
            onClick={exportPDF}
            className="bg-green-500 hover:bg-green-600 transition rounded-2xl px-8 py-5 font-black text-black text-lg"
          >
            Exportar PDF
          </button>

        </div>

      </div>

      {/* EVENT */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 lg:p-8 mt-10">

        <p className="text-zinc-500">
          EVENTO SELECIONADO
        </p>

        <h2 className="text-3xl lg:text-5xl font-black mt-4 text-green-400">
          {selectedEventName}
        </h2>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* TOTAL */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

          <p className="text-zinc-500">
            TOTAL CONVIDADOS
          </p>

          <h2 className="text-5xl font-black mt-4">
            {guests.length}
          </h2>

        </div>

        {/* PRESENT */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

          <p className="text-zinc-500">
            PRESENTES
          </p>

          <h2 className="text-5xl font-black mt-4 text-green-400">

            {
              guests.filter(
                (guest) =>
                  guest.status ===
                  "presente"
              ).length
            }

          </h2>

        </div>

        {/* ABSENT */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8">

          <p className="text-zinc-500">
            AUSENTES
          </p>

          <h2 className="text-5xl font-black mt-4 text-red-400">

            {
              guests.filter(
                (guest) =>
                  guest.status !==
                  "presente"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 lg:p-8 mt-10 overflow-x-auto">

        <table className="w-full min-w-[800px]">

          <thead>

            <tr className="border-b border-zinc-700">

              <th className="text-left py-5">
                Nome
              </th>

              <th className="text-left py-5">
                Tipo
              </th>

              <th className="text-left py-5">
                Status
              </th>

              <th className="text-left py-5">
                Evento
              </th>

            </tr>

          </thead>

          <tbody>

            {guests.map(
              (guest) => (

                <tr
                  key={guest.id}
                  className="border-b border-zinc-800"
                >

                  <td className="py-5">
                    {
                      guest.full_name
                    }
                  </td>

                  <td className="py-5">
                    {
                      guest.ticket_type
                    }
                  </td>

                  <td className="py-5">

                    <span
                      className={`
                        px-4 py-2 rounded-xl font-bold

                        ${
                          guest.status ===
                          "presente"
                            ? "bg-green-500 text-black"
                            : "bg-yellow-500 text-black"
                        }
                      `}
                    >
                      {
                        guest.status
                      }
                    </span>

                  </td>

                  <td className="py-5">
                    {
                      guest.event_name
                    }
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>
    </div>
  )
}