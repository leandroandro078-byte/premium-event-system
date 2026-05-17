"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ReportsPage() {
  const [guests, setGuests] = useState<any[]>([])

  useEffect(() => {
    loadGuests()
  }, [])

  async function loadGuests() {
    const { data } = await supabase
      .from("Convidados")
      .select("*")
      .order("created_at", {
        ascending: false,
      })

    if (data) {
      setGuests(data)
    }
  }

  function exportPDF() {
    const doc = new jsPDF()

    // HEADER
    doc.setFontSize(26)

    doc.text(
      "RELATORIO DE EVENTO",
      14,
      20
    )

    doc.setFontSize(12)

    doc.text(
      `Total Convidados: ${guests.length}`,
      14,
      32
    )

    const presentes = guests.filter(
      (g) => g.checked_in === true
    ).length

    const ausentes =
      guests.length - presentes

    doc.text(
      `Presentes: ${presentes}`,
      14,
      40
    )

    doc.text(
      `Ausentes: ${ausentes}`,
      14,
      48
    )

    // TABELA
    autoTable(doc, {
      startY: 60,

      head: [
        [
          "Nome",
          "Email",
          "Telefone",
          "Tipo",
          "Status",
          "Entrada",
        ],
      ],

      body: guests.map((guest) => [
        guest.full_name || "-",
        guest.email || "-",
        guest.phone || "-",
        guest.ticket_type || "-",
        guest.checked_in
          ? "PRESENTE"
          : "AUSENTE",

        guest.checkin_time
          ? new Date(
              guest.checkin_time
            ).toLocaleTimeString()
          : "--:--",
      ]),

      styles: {
        fillColor: [24, 24, 27],
        textColor: [255, 255, 255],
        lineColor: [39, 39, 42],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: [30, 30, 35],
      },

      bodyStyles: {
        textColor: [255, 255, 255],
      },
    })

    // DOWNLOAD
    doc.save("relatorio-evento.pdf")
  }

  const presentes = guests.filter(
    (guest) =>
      guest.checked_in === true
  ).length

  const ausentes =
    guests.length - presentes

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] p-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-black">
              Relatorios
            </h1>

            <p className="text-zinc-400 mt-2">
              Sistema Premium de Eventos
            </p>
          </div>

          <button
            onClick={exportPDF}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-8 py-4 rounded-2xl text-xl font-bold"
          >
            Exportar PDF
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-[#18181b] p-6 rounded-3xl border border-zinc-800">
            <p className="text-zinc-400">
              Total Convidados
            </p>

            <h2 className="text-5xl font-bold mt-4">
              {guests.length}
            </h2>
          </div>

          <div className="bg-[#18181b] p-6 rounded-3xl border border-zinc-800">
            <p className="text-zinc-400">
              Presentes
            </p>

            <h2 className="text-5xl font-bold mt-4 text-[#4ade80]">
              {presentes}
            </h2>
          </div>

          <div className="bg-[#18181b] p-6 rounded-3xl border border-zinc-800">
            <p className="text-zinc-400">
              Ausentes
            </p>

            <h2 className="text-5xl font-bold mt-4 text-[#f87171]">
              {ausentes}
            </h2>
          </div>
        </div>

        {/* TABELA */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 mt-10 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4">
                  Nome
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Tipo
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Entrada
                </th>
              </tr>
            </thead>

            <tbody>
              {guests.map((guest) => (
                <tr
                  key={guest.id}
                  className="border-b border-zinc-800"
                >
                  <td className="p-4">
                    {guest.full_name}
                  </td>

                  <td className="p-4">
                    {guest.email}
                  </td>

                  <td className="p-4">
                    {guest.ticket_type}
                  </td>

                  <td className="p-4">
                    {guest.checked_in ? (
                      <span className="text-[#4ade80] font-bold">
                        PRESENTE
                      </span>
                    ) : (
                      <span className="text-[#f87171] font-bold">
                        AUSENTE
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {guest.checkin_time
                      ? new Date(
                          guest.checkin_time
                        ).toLocaleTimeString()
                      : "--:--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}