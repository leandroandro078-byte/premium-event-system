"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import QRCode from "qrcode"

export default function EventPage() {

  const params = useParams()

  const [event, setEvent] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  // FORM
  const [fullName, setFullName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [ticketType, setTicketType] =
    useState("NORMAL")

  // SUCCESS
  const [ticketReady, setTicketReady] =
    useState(false)

  const [qrImage, setQrImage] =
    useState("")

  const [ticketLink, setTicketLink] =
    useState("")

  // URL
  const BASE_URL =
    "https://premium-event-system.vercel.app"

  // LOAD EVENT
  useEffect(() => {

    if (params?.id) {

      loadEvent()
    }

  }, [params])

  // GET EVENT
  async function loadEvent() {

    const { data, error } =
      await supabase
        .from("Eventos")
        .select("*")
        .eq(
          "id",
          params.id
        )
        .single()

    if (error) {

      console.log(error)

      return
    }

    setEvent(data)

    setLoading(false)
  }

  // CREATE TICKET
  async function createTicket() {

    if (
      !fullName ||
      !email
    ) {

      alert(
        "Preencha os campos"
      )

      return
    }

    try {

      const token =
        crypto.randomUUID()

      const generatedLink =
        `${BASE_URL}/ticket/${token}`

      // QR
      const qrData =
        await QRCode.toDataURL(
          generatedLink
        )

      setQrImage(qrData)

      setTicketLink(
        generatedLink
      )

      // SAVE
      const { error } =
        await supabase
          .from("Convidados")
          .insert([
            {
              event_id:
                event.id,

              event_name:
                event.title,

              full_name:
                fullName,

              email,

              phone,

              ticket_type:
                ticketType,

              qr_code:
                generatedLink,

              ticket_token:
                token,

              checked_in: false,

              status: "ativo",
            },
          ])

      if (error) {

        console.log(error)

        alert(error.message)

        return
      }

      setTicketReady(true)

    } catch (err) {

      console.log(err)
    }
  }

  // WHATSAPP
  function sendWhatsApp() {

    const message =
`🎟️ BILHETE PREMIUM

Evento:
${event.title}

Convidado:
${fullName}

Tipo:
${ticketType}

LINK:
${ticketLink}`

    const phoneFormatted =
      phone.replace(/\D/g, "")

    const url =
      `https://wa.me/244${phoneFormatted}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank")
  }

  // DOWNLOAD
  function downloadQR() {

    const link =
      document.createElement("a")

    link.href = qrImage

    link.download =
      "ticket.png"

    link.click()
  }

  // COUNTDOWN
  function getCountdown() {

    if (!event?.event_date)
      return "00d 00h 00m"

    const now =
      new Date().getTime()

    const eventTime =
      new Date(
        event.event_date
      ).getTime()

    const difference =
      eventTime - now

    if (difference <= 0)
      return "EVENTO INICIADO"

    const days =
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      )

    const hours =
      Math.floor(
        (
          difference %
          (1000 * 60 * 60 * 24)
        ) /
          (1000 * 60 * 60)
      )

    const minutes =
      Math.floor(
        (
          difference %
          (1000 * 60 * 60)
        ) /
          (1000 * 60)
      )

    return `${days}d ${hours}h ${minutes}m`
  }

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando Evento...
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">

        {/* BANNER */}
        <img
          src={
            event.banner_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
          }
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/75" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 py-24">

          <p className="text-green-400 tracking-[8px] font-bold">
            PREMIUM EVENTS
          </p>

          <h1 className="text-5xl lg:text-8xl font-black mt-6 leading-tight max-w-5xl">
            {event.title}
          </h1>

          <p className="text-zinc-300 text-xl lg:text-2xl mt-8 max-w-3xl leading-relaxed">
            {event.description}
          </p>

          {/* INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            {/* DATE */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">

              <p className="text-zinc-400">
                DATA
              </p>

              <h2 className="text-2xl font-black mt-3">

                {
                  new Date(
                    event.event_date
                  ).toLocaleDateString()
                }

              </h2>

            </div>

            {/* LOCATION */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-6">

              <p className="text-zinc-400">
                LOCAL
              </p>

              <h2 className="text-2xl font-black mt-3">
                {event.location}
              </h2>

            </div>

            {/* COUNTDOWN */}
            <div className="bg-green-500 text-black rounded-3xl p-6">

              <p className="font-bold">
                COUNTDOWN
              </p>

              <h2 className="text-3xl font-black mt-3">
                {getCountdown()}
              </h2>

            </div>

          </div>

          {/* FORM */}
          {!ticketReady && (

            <div className="bg-[#18181b]/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 lg:p-10 mt-16 max-w-3xl">

              <h2 className="text-4xl font-black">
                Inscrição Evento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">

                <input
                  type="text"
                  placeholder="Nome Completo"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(
                      e.target.value
                    )
                  }
                  className="bg-black border border-zinc-700 rounded-2xl p-5"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  className="bg-black border border-zinc-700 rounded-2xl p-5"
                />

                <input
                  type="text"
                  placeholder="Telefone"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  className="bg-black border border-zinc-700 rounded-2xl p-5"
                />

                <select
                  value={ticketType}
                  onChange={(e) =>
                    setTicketType(
                      e.target.value
                    )
                  }
                  className="bg-black border border-zinc-700 rounded-2xl p-5"
                >

                  <option value="NORMAL">
                    NORMAL
                  </option>

                  <option value="VIP">
                    VIP
                  </option>

                </select>

              </div>

              <button
                onClick={createTicket}
                className="w-full bg-green-500 hover:bg-green-600 transition rounded-2xl p-5 mt-8 text-black font-black text-2xl"
              >
                Gerar Bilhete
              </button>

            </div>
          )}

          {/* SUCCESS */}
          {ticketReady && (

            <div className="bg-[#18181b]/95 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 lg:p-10 mt-16 max-w-3xl">

              <h2 className="text-5xl font-black text-green-400">
                Bilhete Gerado
              </h2>

              <p className="text-zinc-400 text-xl mt-5">
                Seu acesso foi criado com sucesso.
              </p>

              {/* QR */}
              <div className="flex justify-center mt-12">

                <div className="bg-white p-5 rounded-3xl">

                  <img
                    src={qrImage}
                    alt="QR"
                    className="w-72"
                  />

                </div>

              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">

                <button
                  onClick={downloadQR}
                  className="bg-blue-500 hover:bg-blue-600 transition rounded-2xl p-5 font-black text-xl"
                >
                  Download QR
                </button>

                <button
                  onClick={sendWhatsApp}
                  className="bg-green-500 hover:bg-green-600 transition rounded-2xl p-5 font-black text-xl text-black"
                >
                  WhatsApp
                </button>

              </div>

              {/* LINK */}
              <div className="bg-black border border-zinc-800 rounded-2xl p-5 mt-8">

                <p className="text-zinc-500">
                  LINK BILHETE
                </p>

                <a
                  href={ticketLink}
                  target="_blank"
                  className="text-green-400 break-all block mt-3"
                >
                  {ticketLink}
                </a>

              </div>

            </div>
          )}

        </div>

      </section>

    </div>
  )
}