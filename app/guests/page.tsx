"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

import QRCode from "qrcode"

import {
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Copy,
} from "lucide-react"

import { FaWhatsapp } from "react-icons/fa"

export default function GuestsPage() {

  const router = useRouter()

  // EVENT
  const [selectedEvent, setSelectedEvent] =
    useState<any>(null)

  // GUESTS
  const [guests, setGuests] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [search, setSearch] =
    useState("")

  // MODAL
  const [editOpen, setEditOpen] =
    useState(false)

  const [editingGuest, setEditingGuest] =
    useState<any>(null)

  // URL
  const BASE_URL =
    "https://premium-event-system.vercel.app"

  // LOAD
  useEffect(() => {

    const auth =
      localStorage.getItem(
        "admin-auth"
      )

    if (!auth) {

      router.push("/login")

      return
    }

    const selectedEventId =
      localStorage.getItem(
        "selected-event-id"
      )

    const selectedEventName =
      localStorage.getItem(
        "selected-event-name"
      )

    if (
      selectedEventId &&
      selectedEventName
    ) {

      setSelectedEvent({
        id: selectedEventId,
        title:
          selectedEventName,
      })
    }

    loadGuests()

  }, [])

  // LOAD GUESTS
  async function loadGuests() {

    try {

      const selectedEventId =
        localStorage.getItem(
          "selected-event-id"
        )

      let query =
        supabase
          .from("Convidados")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          )

      if (selectedEventId) {

        query =
          query.eq(
            "event_id",
            selectedEventId
          )
      }

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

  // DELETE
  async function deleteGuest(
    id: string
  ) {

    const confirmDelete =
      confirm(
        "Eliminar convidado?"
      )

    if (!confirmDelete) return

    const { error } =
      await supabase
        .from("Convidados")
        .delete()
        .eq("id", id)

    if (error) {

      console.log(error)

      return
    }

    alert(
      "✅ Convidado removido"
    )

    loadGuests()
  }

  // OPEN EDIT
  function openEdit(
    guest: any
  ) {

    setEditingGuest(guest)

    setEditOpen(true)
  }

  // CREATE / UPDATE
  async function updateGuest() {

    if (!editingGuest) return

    // CREATE
    if (editingGuest.isNew) {

      const token =
        crypto.randomUUID()

      const ticketLink =
        `${BASE_URL}/ticket/${token}`

      const qrImage =
        await QRCode.toDataURL(
          ticketLink
        )

      const { error } =
        await supabase
          .from("Convidados")
          .insert([
            {
              event_id:
                selectedEvent.id,

              event_name:
                selectedEvent.title,

              full_name:
                editingGuest.full_name,

              email:
                editingGuest.email,

              phone:
                editingGuest.phone,

              ticket_type:
                editingGuest.ticket_type,

              qr_code:
                qrImage,

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

      alert(
        "✅ Ticket criado automaticamente"
      )

    } else {

      // UPDATE
      const { error } =
        await supabase
          .from("Convidados")
          .update({
            full_name:
              editingGuest.full_name,

            email:
              editingGuest.email,

            phone:
              editingGuest.phone,

            ticket_type:
              editingGuest.ticket_type,
          })
          .eq(
            "id",
            editingGuest.id
          )

      if (error) {

        console.log(error)

        alert(error.message)

        return
      }

      alert(
        "✅ Convidado atualizado"
      )
    }

    setEditOpen(false)

    loadGuests()
  }

  // COPY LINK
  async function copyTicketLink(
    token: string
  ) {

    const link =
      `${BASE_URL}/ticket/${token}`

    await navigator.clipboard.writeText(
      link
    )

    alert(
      "✅ Link copiado"
    )
  }

  // OPEN TICKET
  function openTicket(
    token: string
  ) {

    window.open(
      `${BASE_URL}/ticket/${token}`,
      "_blank"
    )
  }

  // WHATSAPP
  function sendWhatsApp(
    guest: any
  ) {

    const link =
      `${BASE_URL}/ticket/${guest.ticket_token}`

    const message =
`🎟️ BILHETE PREMIUM

Evento:
${guest.event_name}

Convidado:
${guest.full_name}

Tipo:
${guest.ticket_type}

LINK:
${link}`

    const phone =
      guest.phone
        ?.replace(/\D/g, "")

    window.open(
      `https://wa.me/244${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
  }

  // FILTER
  const filteredGuests =
    useMemo(() => {

      return guests.filter(
        (guest) =>

          guest.full_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          guest.email
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      )

    }, [guests, search])

  // LOADING
  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-5xl font-black">
          Carregando...
        </h1>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-5 lg:p-10">

      {/* MODAL */}
      {editOpen && editingGuest && (

        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-5">

          <div className="bg-[#18181b] border border-zinc-800 rounded-3xl w-full max-w-2xl p-8">

            <div className="flex items-center justify-between">

              <h2 className="text-3xl font-black">

                {
                  editingGuest.isNew
                    ? "Novo Convidado"
                    : "Editar Convidado"
                }

              </h2>

              <button
                onClick={() =>
                  setEditOpen(false)
                }
              >
                <X size={32} />
              </button>

            </div>

            {/* FORM */}
            <div className="space-y-5 mt-8">

              <input
                type="text"
                placeholder="Nome Completo"
                value={
                  editingGuest.full_name
                }
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    full_name:
                      e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl p-5"
              />

              <input
                type="email"
                placeholder="Email"
                value={
                  editingGuest.email
                }
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    email:
                      e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl p-5"
              />

              <input
                type="text"
                placeholder="Telefone"
                value={
                  editingGuest.phone
                }
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    phone:
                      e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl p-5"
              />

              <select
                value={
                  editingGuest.ticket_type
                }
                onChange={(e) =>
                  setEditingGuest({
                    ...editingGuest,
                    ticket_type:
                      e.target.value,
                  })
                }
                className="w-full bg-black border border-zinc-700 rounded-2xl p-5"
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

            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-5 mt-8">

              <button
                onClick={() =>
                  setEditOpen(false)
                }
                className="bg-zinc-700 hover:bg-zinc-600 transition rounded-2xl p-5 font-bold"
              >
                Cancelar
              </button>

              <button
                onClick={updateGuest}
                className="bg-green-500 hover:bg-green-600 transition rounded-2xl p-5 font-black text-black"
              >
                {
                  editingGuest.isNew
                    ? "Criar"
                    : "Salvar"
                }
              </button>

            </div>

          </div>

        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <p className="text-green-400 tracking-[8px] font-bold text-sm">
            PREMIUM EVENTS
          </p>

          <h1 className="text-4xl lg:text-6xl font-black mt-4">
            Convidados
          </h1>

          <p className="text-zinc-400 mt-3">
            Gestão Profissional de Convidados
          </p>

        </div>

        <button
          onClick={() =>
            router.push(
              "/dashboard"
            )
          }
          className="bg-zinc-800 hover:bg-zinc-700 transition px-6 py-4 rounded-2xl font-bold"
        >
          ← Dashboard
        </button>

      </div>

      {/* EVENT */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 mt-10">

        <p className="text-zinc-500">
          EVENTO ATIVO
        </p>

        <h2 className="text-3xl font-black mt-3 text-green-400">

          {
            selectedEvent?.title
          }

        </h2>

      </div>

      {/* CREATE BUTTON */}
      <div className="flex justify-end mt-8">

        <button
          onClick={() => {

            setEditingGuest({
              full_name: "",
              email: "",
              phone: "",
              ticket_type: "NORMAL",
              isNew: true,
            })

            setEditOpen(true)
          }}
          className="bg-green-500 hover:bg-green-600 transition px-8 py-5 rounded-2xl font-black text-black text-lg"
        >
          + Novo Convidado
        </button>

      </div>

      {/* SEARCH */}
      <div className="mt-8">

        <input
          type="text"
          placeholder="Pesquisar convidado..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl p-5"
        />

      </div>

      {/* TABLE */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-6 mt-8 overflow-x-auto">

        <table className="w-full min-w-[1200px]">

          <thead>

            <tr className="border-b border-zinc-700">

              <th className="text-left py-5">
                Nome
              </th>

              <th className="text-left py-5">
                Email
              </th>

              <th className="text-left py-5">
                Tipo
              </th>

              <th className="text-left py-5">
                Status
              </th>

              <th className="text-left py-5">
                Check-in
              </th>

              <th className="text-left py-5">
                Ticket
              </th>

              <th className="text-left py-5">
                Ações
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredGuests.map(
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
                    {guest.email}
                  </td>

                  <td className="py-5">

                    <span className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold">

                      {
                        guest.ticket_type
                      }

                    </span>

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

                      {guest.status}

                    </span>

                  </td>

                  <td className="py-5">

                    {
                      guest.checked_in
                        ? "✅"
                        : "❌"
                    }

                  </td>

                  {/* TICKET */}
                  <td className="py-5">

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() =>
                          openTicket(
                            guest.ticket_token
                          )
                        }
                        className="bg-green-500 hover:bg-green-600 transition p-3 rounded-xl text-black"
                      >
                        <ExternalLink size={18} />
                      </button>

                      <button
                        onClick={() =>
                          copyTicketLink(
                            guest.ticket_token
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-600 transition p-3 rounded-xl"
                      >
                        <Copy size={18} />
                      </button>

                      <button
                        onClick={() =>
                          sendWhatsApp(
                            guest
                          )
                        }
                        className="bg-green-700 hover:bg-green-800 transition p-3 rounded-xl"
                      >
                        <FaWhatsapp size={18} />
                      </button>

                    </div>

                  </td>

                  {/* ACTIONS */}
                  <td className="py-5">

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() =>
                          openEdit(
                            guest
                          )
                        }
                        className="bg-blue-500 hover:bg-blue-600 transition p-3 rounded-xl"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          deleteGuest(
                            guest.id
                          )
                        }
                        className="bg-red-500 hover:bg-red-600 transition p-3 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

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