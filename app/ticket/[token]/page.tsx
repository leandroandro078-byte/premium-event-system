import { supabase } from "@/lib/supabase"
import QRCode from "qrcode"

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function TicketPage({
  params,
}: PageProps) {
  const { token } = await params

  const { data: guest } =
    await supabase
      .from("Convidados")
      .select("*")
      .eq("ticket_token", token)
      .single()

  // NÃO ENCONTRADO
  if (!guest) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl font-black text-red-500">
          Bilhete não encontrado
        </h1>
      </div>
    )
  }

  // GERAR QR
  const qrImage =
    await QRCode.toDataURL(
      guest.qr_code
    )

  // TICKET
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#18181b] border border-zinc-700 rounded-3xl p-10">
        {/* HEADER */}
        <p className="text-green-400 font-bold tracking-[8px]">
          EVENT PASS
        </p>

        {/* EVENTO */}
        <h1 className="text-5xl font-black mt-6 leading-tight">
          {guest.event_name}
        </h1>

        {/* CONVIDADO */}
        <div className="mt-10">
          <p className="text-zinc-400 text-xl">
            CONVIDADO
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {guest.full_name}
          </h2>
        </div>

        {/* TIPO */}
        <div className="mt-10">
          <p className="text-zinc-400 text-xl">
            TIPO
          </p>

          <h2 className="text-4xl font-bold text-green-400 mt-3">
            {guest.ticket_type}
          </h2>
        </div>

        {/* QR CODE */}
        <div className="mt-12 flex justify-center">
          <div className="bg-white p-5 rounded-3xl">
            <img
              src={qrImage}
              alt="QR CODE"
              className="w-72"
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-10">
          {guest.checked_in ? (
            <div className="bg-green-500/20 border border-green-500 p-5 rounded-2xl">
              <p className="text-green-400 text-2xl font-bold text-center">
                ✅ ENTRADA REGISTRADA
              </p>
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500 p-5 rounded-2xl">
              <p className="text-yellow-400 text-2xl font-bold text-center">
                ⏳ AGUARDANDO CHECK-IN
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}