"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import QRCode from "qrcode"

export default function TicketPage() {

  const params = useParams()

  const [guest, setGuest] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [qrImage, setQrImage] =
    useState("")

  // LOAD
  useEffect(() => {

    if (params?.token) {

      loadTicket()
    }

  }, [params])

  // LOAD TICKET
  async function loadTicket() {

    try {

      const { data, error } =
        await supabase
          .from("Convidados")
          .select("*")
          .eq(
            "ticket_token",
            params.token
          )
          .single()

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setGuest(data)

      // GENERATE QR IMAGE
      const qr =
        await QRCode.toDataURL(
          data.qr_code
        )

      setQrImage(qr)

      setLoading(false)

    } catch (err) {

      console.log(err)

      setLoading(false)
    }
  }

  // DOWNLOAD
  function downloadQR() {

    const link =
      document.createElement("a")

    link.href =
      qrImage

    link.download =
      "ticket-qr.png"

    link.click()
  }

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando Bilhete...
        </h1>

      </div>
    )
  }

  // INVALID
  if (!guest) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black text-red-500">
          Bilhete Não Encontrado
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-5">

      <div className="bg-[#18181b] border border-zinc-800 rounded-[40px] overflow-hidden max-w-5xl w-full">

        {/* TOP */}
        <div className="bg-green-500 text-black p-10">

          <p className="tracking-[8px] font-black text-sm">
            PREMIUM EVENTS
          </p>

          <h1 className="text-5xl lg:text-7xl font-black mt-6">
            {guest.event_name}
          </h1>

        </div>

        {/* BODY */}
        <div className="grid lg:grid-cols-2">

          {/* LEFT */}
          <div className="p-10">

            <p className="text-zinc-500">
              CONVIDADO
            </p>

            <h2 className="text-5xl font-black mt-5">
              {guest.full_name}
            </h2>

            <div className="space-y-8 mt-12">

              <div>

                <p className="text-zinc-500">
                  EMAIL
                </p>

                <h3 className="text-2xl font-bold mt-3">
                  {guest.email}
                </h3>

              </div>

              <div>

                <p className="text-zinc-500">
                  TIPO
                </p>

                <span className="bg-green-500 text-black px-6 py-3 rounded-2xl font-black text-xl inline-block mt-3">

                  {guest.ticket_type}

                </span>

              </div>

              <div>

                <p className="text-zinc-500">
                  STATUS
                </p>

                <span
                  className={`
                    px-6 py-3 rounded-2xl font-black text-xl inline-block mt-3

                    ${
                      guest.checked_in
                        ? "bg-green-500 text-black"
                        : "bg-yellow-500 text-black"
                    }
                  `}
                >

                  {
                    guest.checked_in
                      ? "PRESENTE"
                      : "ATIVO"
                  }

                </span>

              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="bg-black/40 border-l border-zinc-800 p-10 flex flex-col items-center justify-center">

            <div className="bg-white p-5 rounded-[40px]">

              <img
                src={qrImage}
                alt="QR"
                className="w-72 lg:w-96"
              />

            </div>

            <button
              onClick={downloadQR}
              className="bg-green-500 hover:bg-green-600 transition px-10 py-5 rounded-2xl mt-10 text-black font-black text-xl"
            >
              Download QR
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}