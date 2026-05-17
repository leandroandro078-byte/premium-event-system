"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckinPage() {
  const [result, setResult] = useState("")
  const [guest, setGuest] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [currentTime, setCurrentTime] = useState("")

  const processingRef = useRef(false)

  // SONS
  const successSoundRef =
    useRef<HTMLAudioElement | null>(null)

  const errorSoundRef =
    useRef<HTMLAudioElement | null>(null)

  // RELÓGIO
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      setCurrentTime(
        now.toLocaleTimeString()
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    successSoundRef.current = new Audio(
      "/sounds/success.mp3"
    )

    errorSoundRef.current = new Audio(
      "/sounds/error.mp3"
    )

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 5,
        qrbox: {
          width: 300,
          height: 300,
        },
      },
      false
    )

    scanner.render(success, error)

    async function success(decodedText: string) {
      if (processingRef.current) return

      processingRef.current = true

      try {
        try {
          scanner.pause(true)
        } catch {}

        setResult(decodedText)

        // BUSCAR QR
        const { data, error } = await supabase
          .from("Convidados")
          .select("*")
          .eq("qr_code", decodedText)
          .single()

        // NÃO ENCONTRADO
        if (error || !data) {
          setGuest(null)

          setStatus("not-found")

          errorSoundRef.current?.play()

          restartScanner(scanner)

          return
        }

        // DUPLICADO
        if (data.checked_in === true) {
          setGuest(data)

          setStatus("duplicate")

          errorSoundRef.current?.play()

          restartScanner(scanner)

          return
        }

        // CHECK-IN
        const now = new Date().toISOString()

        const { error: updateError } =
          await supabase
            .from("Convidados")
            .update({
              checked_in: true,
              checkin_time: now,
              status: "presente",
            })
            .eq("id", data.id)

        if (updateError) {
          errorSoundRef.current?.play()

          restartScanner(scanner)

          return
        }

        const updatedGuest = {
          ...data,
          checked_in: true,
          checkin_time: now,
          status: "presente",
        }

        setGuest(updatedGuest)

        setStatus("success")

        successSoundRef.current?.play()

        restartScanner(scanner)
      } catch (err) {
        console.log(err)

        errorSoundRef.current?.play()

        restartScanner(scanner)
      }
    }

    function restartScanner(scannerInstance: any) {
      setTimeout(() => {
        processingRef.current = false

        setStatus("")

        setGuest(null)

        try {
          scannerInstance.resume()
        } catch {}
      }, 5000)
    }

    function error(err: any) {
      console.log(err)
    }

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between p-8 border-b border-zinc-900">
        <div>
          <h1 className="text-6xl font-black">
            EVENT CHECK-IN
          </h1>

          <p className="text-zinc-400 mt-2">
            Sistema Premium de Eventos
          </p>
        </div>

        <div className="text-right">
          <p className="text-zinc-400">
            HORÁRIO
          </p>

          <h2 className="text-5xl font-bold">
            {currentTime}
          </h2>
        </div>
      </div>

      {/* CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10">
        {/* SCANNER */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <div
            id="reader"
            className="overflow-hidden rounded-2xl"
          />

          <div className="mt-6">
            <p className="text-zinc-400">
              Último QR:
            </p>

            <p className="break-all mt-2 text-lg">
              {result || "Nenhum QR lido"}
            </p>
          </div>
        </div>

        {/* STATUS */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* SUCESSO */}
            {status === "success" &&
              guest && (
                <motion.div
                  key="success"
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  className="bg-green-500/20 border border-green-400 rounded-3xl p-10 shadow-[0_0_60px_rgba(0,255,120,0.3)]"
                >
                  <h2 className="text-7xl font-black text-green-400">
                    LIBERADO
                  </h2>

                  <div className="mt-10 space-y-5">
                    <p className="text-4xl font-bold">
                      {guest.full_name}
                    </p>

                    <p className="text-2xl">
                      {guest.email}
                    </p>

                    <p className="text-2xl">
                      {guest.phone}
                    </p>

                    <p className="text-3xl font-bold text-green-300">
                      {guest.ticket_type}
                    </p>

                    <p className="text-xl text-zinc-300">
                      Entrada:
                      {" "}
                      {guest.checkin_time
                        ? new Date(
                            guest.checkin_time
                          ).toLocaleTimeString()
                        : "--:--"}
                    </p>
                  </div>
                </motion.div>
              )}

            {/* DUPLICADO */}
            {status === "duplicate" &&
              guest && (
                <motion.div
                  key="duplicate"
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  className="bg-red-500/20 border border-red-400 rounded-3xl p-10 shadow-[0_0_60px_rgba(255,0,0,0.3)]"
                >
                  <h2 className="text-7xl font-black text-red-400">
                    QR USADO
                  </h2>

                  <div className="mt-10 space-y-5">
                    <p className="text-4xl font-bold">
                      {guest.full_name}
                    </p>

                    <p className="text-2xl">
                      {guest.email}
                    </p>

                    <p className="text-2xl">
                      {guest.phone}
                    </p>

                    <p className="text-3xl font-bold text-red-300">
                      {guest.ticket_type}
                    </p>

                    <p className="text-xl text-zinc-300">
                      Entrada anterior:
                      {" "}
                      {guest.checkin_time
                        ? new Date(
                            guest.checkin_time
                          ).toLocaleTimeString()
                        : "--:--"}
                    </p>
                  </div>
                </motion.div>
              )}

            {/* NÃO ENCONTRADO */}
            {status === "not-found" && (
              <motion.div
                key="not-found"
                initial={{
                  scale: 0.8,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0.8,
                  opacity: 0,
                }}
                className="bg-yellow-500/20 border border-yellow-400 rounded-3xl p-10 shadow-[0_0_60px_rgba(255,255,0,0.2)]"
              >
                <h2 className="text-7xl font-black text-yellow-300">
                  QR INVÁLIDO
                </h2>

                <p className="mt-10 text-3xl">
                  Convidado não encontrado
                </p>
              </motion.div>
            )}

            {/* PADRÃO */}
            {!status && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <h2 className="text-5xl font-bold">
                    AGUARDANDO QR
                  </h2>

                  <p className="text-zinc-500 mt-4 text-xl">
                    Escaneie um bilhete para liberar entrada
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}