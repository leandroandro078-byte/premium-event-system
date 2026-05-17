"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function GuestsListPage() {

  const [guests, setGuests] = useState<any[]>([])

  useEffect(() => {
    loadGuests()
  }, [])

  async function loadGuests() {

    const { data, error } = await supabase
      .from("Convidados")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setGuests(data)
    }

    if (error) {
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-2">
        Lista de Convidados
      </h1>

      <p className="text-zinc-400 mb-10">
        Gestão profissional de convidados e QR Codes
      </p>

      {guests.length === 0 ? (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Nenhum convidado encontrado
          </h2>

          <p className="text-zinc-400">
            Crie convidados para visualizar os QR Codes
          </p>
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {guests.map((guest) => (

            <div
              key={guest.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >

              <h2 className="text-2xl font-bold mb-2">
                {guest.full_name}
              </h2>

              <p className="text-zinc-400 mb-1">
                {guest.email}
              </p>

              <p className="text-zinc-400 mb-4">
                {guest.phone}
              </p>

              <div className="flex items-center gap-2 mb-4">

                <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {guest.ticket_type}
                </span>

                {guest.checked_in ? (
                  <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                    CHECK-IN
                  </span>
                ) : (
                  <span className="bg-red-500 px-3 py-1 rounded-full text-sm">
                    PENDENTE
                  </span>
                )}

              </div>

              <div className="bg-white p-4 rounded-xl">

                <Image
                  src={guest.qr_code}
                  alt="QR Code"
                  width={250}
                  height={250}
                  className="w-full"
                />

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}