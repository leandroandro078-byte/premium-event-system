"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import QRCode from "qrcode"

export default function GuestsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] =
    useState<any>(null)

  const [fullName, setFullName] =
    useState("")

  const [email, setEmail] = useState("")

  const [phone, setPhone] = useState("")

  const [ticketType, setTicketType] =
    useState("NORMAL")

  const [qrImage, setQrImage] =
    useState("")

  const [qrValue, setQrValue] =
    useState("")

  const [ticketToken, setTicketToken] =
    useState("")

  const [ticketReady, setTicketReady] =
    useState(false)

  // LINK NGROK
  const BASE_URL =
    "https://premium-event-system.vercel.app"

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from("Eventos")
      .select("*")

    if (data) {
      setEvents(data)
    }
  }

  async function createGuest() {
    if (
      !selectedEvent ||
      !fullName ||
      !email
    ) {
      alert("Preencha todos os campos")
      return
    }

    // QR CODE VALUE
    const generatedQR =
      `${fullName}-${Date.now()}`

    // TOKEN ÚNICO
    const token =
      crypto.randomUUID()

    // SALVAR TOKEN
    setTicketToken(token)

    // BACKUP TOKEN
    localStorage.setItem(
      "last_ticket_token",
      token
    )

    setQrValue(generatedQR)

    // GERAR QR
    const qrData =
      await QRCode.toDataURL(
        generatedQR
      )

    setQrImage(qrData)

    // SALVAR NO SUPABASE
    const { error } = await supabase
      .from("Convidados")
      .insert([
        {
          event_id: selectedEvent.id,
          event_name:
            selectedEvent.title,
          full_name: fullName,
          email,
          phone,
          ticket_type: ticketType,
          qr_code: generatedQR,
          ticket_token: token,
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

    alert(
      "✅ CONVIDADO CRIADO COM SUCESSO"
    )
  }

  // DOWNLOAD QR
  function downloadQRCode() {
    const link =
      document.createElement("a")

    link.href = qrImage

    link.download =
      `${fullName}-QR.png`

    link.click()
  }

  // WHATSAPP
  function sendWhatsApp() {
    const finalToken =
      ticketToken ||
      localStorage.getItem(
        "last_ticket_token"
      )

    const ticketLink =
      `${BASE_URL}/ticket/${finalToken}`

    const message =
`🎟️ BILHETE PREMIUM

Evento: ${selectedEvent?.title}

Convidado: ${fullName}

Tipo: ${ticketType}

====================

LINK DO BILHETE:

${ticketLink}

====================

Apresente este QR na entrada.`

    // LIMPAR TELEFONE
    const phoneFormatted =
      phone.replace(/\D/g, "")

    // URL WHATSAPP
    const url =
      `https://wa.me/244${phoneFormatted}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
        {/* FORMULÁRIO */}
        <div className="bg-[#18181b] border border-zinc-800 p-8 rounded-3xl">
          <h1 className="text-5xl font-black mb-8">
            Novo Convidado
          </h1>

          {/* EVENTOS */}
          <select
            onChange={(e) => {
              const event =
                events.find(
                  (ev) =>
                    ev.id ===
                    e.target.value
                )

              setSelectedEvent(event)
            }}
            className="w-full bg-zinc-800 p-5 rounded-xl mb-4"
          >
            <option>
              Selecione Evento
            </option>

            {events.map((event) => (
              <option
                key={event.id}
                value={event.id}
              >
                {event.title}
              </option>
            ))}
          </select>

          {/* NOME */}
          <input
            type="text"
            placeholder="Nome Completo"
            value={fullName}
            onChange={(e) =>
              setFullName(
                e.target.value
              )
            }
            className="w-full bg-zinc-800 p-5 rounded-xl mb-4"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full bg-zinc-800 p-5 rounded-xl mb-4"
          />

          {/* TELEFONE */}
          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            className="w-full bg-zinc-800 p-5 rounded-xl mb-4"
          />

          {/* TIPO */}
          <select
            value={ticketType}
            onChange={(e) =>
              setTicketType(
                e.target.value
              )
            }
            className="w-full bg-zinc-800 p-5 rounded-xl mb-8"
          >
            <option value="NORMAL">
              NORMAL
            </option>

            <option value="VIP">
              VIP
            </option>

            <option value="STAFF">
              STAFF
            </option>
          </select>

          {/* BOTÃO */}
          <button
            onClick={createGuest}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold p-5 rounded-xl text-xl"
          >
            Criar Bilhete
          </button>
        </div>

        {/* BILHETE */}
        <div>
          {ticketReady && (
            <>
              <div className="bg-[#18181b] border border-zinc-700 rounded-3xl p-10">
                {/* HEADER */}
                <p className="text-green-400 font-bold tracking-[5px]">
                  EVENT PASS
                </p>

                <h2 className="text-5xl font-black mt-4">
                  {selectedEvent?.title}
                </h2>

                {/* NOME */}
                <div className="mt-10">
                  <p className="text-zinc-400">
                    CONVIDADO
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    {fullName}
                  </h3>
                </div>

                {/* TIPO */}
                <div className="mt-6">
                  <p className="text-zinc-400">
                    TIPO
                  </p>

                  <h3 className="text-2xl font-bold mt-2 text-green-400">
                    {ticketType}
                  </h3>
                </div>

                {/* QR */}
                <div className="mt-10 bg-white p-4 rounded-2xl inline-block">
                  <img
                    src={qrImage}
                    alt="QR"
                    className="w-64"
                  />
                </div>

                {/* CÓDIGO */}
                <p className="mt-4 text-zinc-500 break-all">
                  {qrValue}
                </p>

                {/* LINK */}
                <div className="mt-6 bg-zinc-800 p-4 rounded-xl">
                  <p className="text-sm text-zinc-400">
                    LINK DO BILHETE
                  </p>

                  <a
                    href={`${BASE_URL}/ticket/${ticketToken}`}
                    target="_blank"
                    className="break-all mt-2 text-green-400 block hover:underline"
                  >
                    {BASE_URL}/ticket/{ticketToken}
                  </a>
                </div>

                <p className="mt-8 text-zinc-500">
                  Sistema Premium de Eventos
                </p>
              </div>

              {/* DOWNLOAD */}
              <button
                onClick={downloadQRCode}
                className="w-full mt-6 bg-blue-500 hover:bg-blue-600 p-5 rounded-xl text-xl font-bold"
              >
                Download QR Code
              </button>

              {/* WHATSAPP */}
              <button
                onClick={sendWhatsApp}
                className="w-full mt-4 bg-[#22c55e] hover:bg-[#16a34a] p-5 rounded-xl text-xl font-bold text-black"
              >
                Enviar WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}