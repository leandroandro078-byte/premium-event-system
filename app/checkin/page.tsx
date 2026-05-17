"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Html5QrcodeScanner } from "html5-qrcode"
import { supabase } from "@/lib/supabase"

export default function CheckinPage() {

  const router = useRouter()

  const scannerRef = useRef<any>(null)

  const [loading, setLoading] =
    useState(true)

  const [message, setMessage] =
    useState("")

  const [guest, setGuest] =
    useState<any>(null)

  const [audioEnabled, setAudioEnabled] =
    useState(false)

  const [selectedEventName, setSelectedEventName] =
    useState("Check-in Scanner")

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

    // EVENT NAME
    const eventName =
      localStorage.getItem(
        "selected-event-name"
      )

    if (eventName) {

      setSelectedEventName(
        eventName
      )
    }

    setLoading(false)

  }, [])

  // START SCANNER
  useEffect(() => {

    if (loading) return

    if (!scannerRef.current) {

      scannerRef.current =
        new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,

            qrbox: {
              width: 280,
              height: 280,
            },

            aspectRatio: 1,
          },
          false
        )

      scannerRef.current.render(
        handleScan,
        handleError
      )
    }

    return () => {

      if (scannerRef.current) {

        scannerRef.current
          .clear()
          .catch(() => {})
      }
    }

  }, [loading])

  // SUCCESS SOUND
  function playSuccess() {

    const audio =
      new Audio(
        "/sounds/success.mp3"
      )

    if (audioEnabled) {
      audio.play()
    }
  }

  // ERROR SOUND
  function playError() {

    const audio =
      new Audio(
        "/sounds/error.mp3"
      )

    if (audioEnabled) {
      audio.play()
    }
  }

  // HANDLE SCAN
  async function handleScan(
    decodedText: string
  ) {

    try {

      // EXTRAIR TOKEN
      const parts =
        decodedText.split(
          "/ticket/"
        )

      const token =
        parts[1]

      if (!token) {

        setMessage(
          "QR INVÁLIDO"
        )

        playError()

        return
      }

      // EVENTO ATIVO
      const selectedEventId =
        localStorage.getItem(
          "selected-event-id"
        )

      // SEARCH GUEST
      const { data, error } =
        await supabase
          .from("Convidados")
          .select("*")
          .eq(
            "ticket_token",
            token
          )
          .eq(
            "event_id",
            selectedEventId
          )
          .single()

      if (error || !data) {

        setMessage(
          "BILHETE NÃO ENCONTRADO"
        )

        playError()

        return
      }

      // DUPLICATE
      if (
        data.checked_in === true
      ) {

        setGuest(data)

        setMessage(
          "CHECK-IN JÁ REALIZADO"
        )

        playError()

        return
      }

      // UPDATE
      await supabase
        .from("Convidados")
        .update({
          checked_in: true,
          status: "presente",
          checkin_time:
            new Date(),
        })
        .eq("id", data.id)

      setGuest(data)

      setMessage(
        "CHECK-IN REALIZADO"
      )

      playSuccess()

    } catch (err) {

      console.log(err)

      setMessage(
        "ERRO NO SCANNER"
      )

      playError()
    }
  }

  // ERROR
  function handleError(err: any) {
    console.log(err)
  }

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-4xl lg:text-6xl font-black">
          Carregando...
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-10">

      {/* AUDIO ENABLE */}
      {!audioEnabled && (

        <div className="bg-yellow-500/20 border border-yellow-500 rounded-3xl p-6 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>

            <h2 className="text-2xl font-black text-yellow-400">
              Ativar Som
            </h2>

            <p className="text-zinc-300 mt-2">
              Clique para ativar os sons do scanner.
            </p>

          </div>

          <button
            onClick={() => {

              const audio =
                new Audio(
                  "/sounds/success.mp3"
                )

              audio.play()

              setAudioEnabled(true)
            }}
            className="bg-yellow-400 hover:bg-yellow-500 transition text-black px-8 py-4 rounded-2xl font-black"
          >
            Ativar Áudio
          </button>

        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <p className="text-green-400 tracking-[8px] font-bold text-sm">
            PREMIUM EVENTS
          </p>

          <h1 className="text-4xl lg:text-6xl font-black mt-4">
            {selectedEventName}
          </h1>

          <p className="text-zinc-400 mt-3">
            Sistema Profissional de Entrada
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

      {/* CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">

        {/* SCANNER */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-5 lg:p-8">

          <h2 className="text-2xl lg:text-3xl font-black mb-8">
            Scanner QR
          </h2>

          <div
            id="reader"
            className="overflow-hidden rounded-3xl"
          />
        </div>

        {/* RESULT */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-5 lg:p-8">

          <h2 className="text-2xl lg:text-3xl font-black">
            Resultado
          </h2>

          {/* STATUS */}
          <div className="mt-8 bg-black border border-zinc-800 rounded-3xl p-6">

            <p className="text-zinc-500">
              STATUS
            </p>

            <h1
              className={`text-3xl lg:text-5xl font-black mt-4 leading-tight ${
                message ===
                "CHECK-IN REALIZADO"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message || "AGUARDANDO QR"}
            </h1>

          </div>

          {/* GUEST */}
          {guest && (

            <div className="mt-8 bg-black border border-zinc-800 rounded-3xl p-6">

              <p className="text-zinc-500">
                CONVIDADO
              </p>

              <h2 className="text-3xl lg:text-5xl font-black mt-4 leading-tight">
                {guest.full_name}
              </h2>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                <div>

                  <p className="text-zinc-500">
                    TIPO
                  </p>

                  <h3 className="text-2xl font-black text-green-400 mt-3">
                    {
                      guest.ticket_type
                    }
                  </h3>

                </div>

                <div>

                  <p className="text-zinc-500">
                    EVENTO
                  </p>

                  <h3 className="text-2xl font-black mt-3">
                    {
                      guest.event_name
                    }
                  </h3>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}