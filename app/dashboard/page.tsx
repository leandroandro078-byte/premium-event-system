"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function DashboardPage() {
  const [events, setEvents] = useState(0)
  const [guests, setGuests] = useState(0)
  const [present, setPresent] = useState(0)

  const [vip, setVip] = useState(0)
  const [normal, setNormal] = useState(0)
  const [staff, setStaff] = useState(0)

  const [latestCheckins, setLatestCheckins] =
    useState<any[]>([])

  useEffect(() => {
    loadDashboard()

    // REALTIME
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Convidados",
        },
        () => {
          loadDashboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadDashboard() {
    // EVENTOS
    const { data: eventsData } = await supabase
      .from("Eventos")
      .select("*")

    setEvents(eventsData?.length || 0)

    // CONVIDADOS
    const { data: guestsData } = await supabase
      .from("Convidados")
      .select("*")
      .order("created_at", {
        ascending: false,
      })

    setGuests(guestsData?.length || 0)

    // PRESENTES
    const presentGuests =
      guestsData?.filter(
        (guest) => guest.checked_in === true
      ) || []

    setPresent(presentGuests.length)

    // VIP
    const vipGuests =
      presentGuests.filter(
        (guest) => guest.ticket_type === "VIP"
      ) || []

    setVip(vipGuests.length)

    // NORMAL
    const normalGuests =
      presentGuests.filter(
        (guest) => guest.ticket_type === "NORMAL"
      ) || []

    setNormal(normalGuests.length)

    // STAFF
    const staffGuests =
      presentGuests.filter(
        (guest) => guest.ticket_type === "STAFF"
      ) || []

    setStaff(staffGuests.length)

    // ÚLTIMOS CHECKINS
    const latest =
      presentGuests
        .sort(
          (a, b) =>
            new Date(
              b.checkin_time
            ).getTime() -
            new Date(
              a.checkin_time
            ).getTime()
        )
        .slice(0, 5) || []

    setLatestCheckins(latest)
  }

  const chartData = [
    {
      name: "VIP",
      total: vip,
    },
    {
      name: "NORMAL",
      total: normal,
    },
    {
      name: "STAFF",
      total: staff,
    },
  ]

  const pieData = [
    {
      name: "Presentes",
      value: present,
    },
    {
      name: "Ausentes",
      value: guests - present,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-6xl font-bold">
        Dashboard Admin
      </h1>

      <p className="text-zinc-400 mt-2">
        Sistema Premium de Gestão de Eventos
      </p>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            Eventos
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {events}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            Convidados
          </p>

          <h2 className="text-5xl font-bold mt-4">
            {guests}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            Presentes
          </p>

          <h2 className="text-5xl font-bold mt-4 text-green-400">
            {present}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            Ausentes
          </p>

          <h2 className="text-5xl font-bold mt-4 text-red-400">
            {guests - present}
          </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* BAR CHART */}
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">
            Tipos de Bilhetes
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart data={chartData}>
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="total"
                fill="#00ff66"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">
            Presença do Evento
          </h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={120}
                label
              >
                <Cell fill="#00ff66" />

                <Cell fill="#ff3333" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            VIP Presentes
          </p>

          <h2 className="text-4xl font-bold mt-4 text-yellow-400">
            {vip}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            NORMAL Presentes
          </p>

          <h2 className="text-4xl font-bold mt-4 text-blue-400">
            {normal}
          </h2>
        </div>

        <div className="bg-zinc-900 p-6 rounded-2xl">
          <p className="text-zinc-400">
            STAFF Presentes
          </p>

          <h2 className="text-4xl font-bold mt-4 text-purple-400">
            {staff}
          </h2>
        </div>
      </div>

      {/* ÚLTIMOS CHECKINS */}
      <div className="bg-zinc-900 p-6 rounded-2xl mt-10">
        <h2 className="text-3xl font-bold mb-6">
          Últimos Check-ins
        </h2>

        <div className="space-y-4">
          {latestCheckins.map((guest) => (
            <div
              key={guest.id}
              className="bg-black p-4 rounded-xl border border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xl">
                    {guest.full_name}
                  </p>

                  <p className="text-zinc-400">
                    {guest.ticket_type}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-green-400 font-bold">
                    PRESENTE
                  </p>

                  <p className="text-zinc-500 text-sm">
                    {new Date(
                      guest.checkin_time
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}