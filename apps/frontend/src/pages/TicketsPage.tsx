import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCoproprieteStore } from '@/store/coproprieteStore'
import { useAuthStore } from '@/store/authStore'
import {
  useTicketsByCopropriete,
  useTicket,
  useCreateTicket,
  useUpdateTicket,
  useDeleteTicket,
  useAddTicketMessage,
} from '@/hooks/useTickets'
import { ErrorAlert } from '@/components/layout/ErrorAlert'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormSection } from '@/components/ui/form-section'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Ticket, TicketMessage } from '@/types'
import {
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Send,
  Clock,
  Info,
} from 'lucide-react'

const CATEGORIE_LABELS: Record<string, string> = {
  general: 'General',
  maintenance: 'Maintenance',
  financier: 'Financier',
  juridique: 'Juridique',
  autre: 'Autre',
}

const CATEGORIE_COLORS: Record<string, string> = {
  general: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  financier: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  juridique: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  autre: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

const STATUT_LABELS: Record<string, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  resolu: 'Resolu',
  ferme: 'Ferme',
}

const STATUT_COLORS: Record<string, string> = {
  ouvert: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  en_cours: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolu: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ferme: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
}

const PRIORITE_LABELS: Record<string, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
}

const PRIORITE_COLORS: Record<string, string> = {
  basse: 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300',
  normale: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  haute: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const ticketSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  categorie: z.enum(['general', 'maintenance', 'financier', 'juridique', 'autre']),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
})

type TicketFormData = z.infer<typeof ticketSchema>

const updateTicketSchema = z.object({
  sujet: z.string().min(1, 'Le sujet est obligatoire'),
  categorie: z.enum(['general', 'maintenance', 'financier', 'juridique', 'autre']),
  statut: z.enum(['ouvert', 'en_cours', 'resolu', 'ferme']),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
})

type UpdateTicketFormData = z.infer<typeof updateTicketSchema>

export default function TicketsPage() {
  const [searchParams] = useSearchParams()
  const { selectedCoproprieteId: selectedCoproId, setSelectedCoproprieteId } = useCoproprieteStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const param = searchParams.get('copropriete')
    if (param) setSelectedCoproprieteId(parseInt(param))
  }, [searchParams, setSelectedCoproprieteId])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    data: tickets,
    isLoading,
    isError,
    error,
  } = useTicketsByCopropriete(selectedCoproId)
  const {
    data: selectedTicket,
    isLoading: loadingDetail,
  } = useTicket(selectedTicketId ?? undefined)

  const createTicket = useCreateTicket()
  const updateTicket = useUpdateTicket()
  const deleteTicket = useDeleteTicket()
  const addMessage = useAddTicketMessage()

  const createForm = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      sujet: '',
      categorie: 'general',
      priorite: 'normale',
    },
  })

  const editForm = useForm<UpdateTicketFormData>({
    resolver: zodResolver(updateTicketSchema),
    defaultValues: {
      sujet: '',
      categorie: 'general',
      statut: 'ouvert',
      priorite: 'normale',
    },
  })

  useEffect(() => {
    if (editingTicket) {
      editForm.reset({
        sujet: editingTicket.sujet,
        categorie: editingTicket.categorie as UpdateTicketFormData['categorie'],
        statut: editingTicket.statut as UpdateTicketFormData['statut'],
        priorite: editingTicket.priorite as UpdateTicketFormData['priorite'],
      })
    }
  }, [editingTicket, editForm])

  useEffect(() => {
    if (selectedTicket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedTicket?.messages])

  const handleCreate = async (data: TicketFormData) => {
    if (!selectedCoproId) return
    await createTicket.mutateAsync({
      ...data,
      copropriete_id: selectedCoproId,
      auteur_id: user?.id,
    })
    setShowCreateDialog(false)
    createForm.reset()
  }

  const handleUpdate = async (data: UpdateTicketFormData) => {
    if (!editingTicket) return
    await updateTicket.mutateAsync({ id: editingTicket.id, data })
    setShowEditDialog(false)
    setEditingTicket(null)
  }

  const handleSendMessage = async () => {
    if (!selectedTicketId || !newMessage.trim()) return
    await addMessage.mutateAsync({
      ticketId: selectedTicketId,
      data: { contenu: newMessage.trim(), auteur_id: user?.id },
    })
    setNewMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Detail view
  if (selectedTicketId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTicketId(null)}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {selectedTicket?.sujet ?? 'Chargement...'}
            </h1>
            {selectedTicket && (
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[selectedTicket.statut]}`}>
                  {STATUT_LABELS[selectedTicket.statut]}
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[selectedTicket.categorie]}`}>
                  {CATEGORIE_LABELS[selectedTicket.categorie]}
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_COLORS[selectedTicket.priorite]}`}>
                  {PRIORITE_LABELS[selectedTicket.priorite]}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  par {selectedTicket.auteur_nom ?? 'Inconnu'} le{' '}
                  {new Date(selectedTicket.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}
          </div>
          {selectedTicket && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingTicket(selectedTicket)
                  setShowEditDialog(true)
                }}
                className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => setDeleteId(selectedTicket.id)}
                className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Messages thread */}
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Messages</h2>
          </div>

          {loadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="max-h-[500px] space-y-4 overflow-y-auto p-4">
                {(!selectedTicket?.messages || selectedTicket.messages.length === 0) ? (
                  <div className="flex flex-col items-center py-8">
                    <MessageSquare className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                    <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun message pour le moment</p>
                  </div>
                ) : (
                  selectedTicket.messages.map((msg: TicketMessage) => {
                    const isOwn = msg.auteur_id === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-3 ${
                            isOwn
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 text-stone-900 dark:bg-stone-700 dark:text-white'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                            <span className="font-medium">{msg.auteur_nom ?? 'Inconnu'}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(msg.created_at).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{msg.contenu}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="border-t border-stone-200 p-4 dark:border-stone-700">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ecrire un message..."
                    className="min-h-[44px] resize-none"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || addMessage.isPending}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Edit dialog */}
        <FormDialog
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open)
            if (!open) setEditingTicket(null)
          }}
          title="Modifier le ticket"
          form={editForm}
          onSubmit={handleUpdate}
          isLoading={updateTicket.isPending}
        >
          <FormSection icon={Info} label="Informations">
            <FormField
              control={editForm.control}
              name="sujet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Sujet du ticket" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={editForm.control}
                name="categorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="priorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorite</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRIORITE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        </FormDialog>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Messagerie</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Echangez avec les coproprietaires via des tickets de support
          </p>
        </div>
      </div>

      {isError && (
        <ErrorAlert error={error as Error} message="Impossible de charger les tickets" />
      )}

      {!selectedCoproId ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 p-12 dark:border-stone-600">
          <MessageSquare className="h-12 w-12 text-stone-400 dark:text-stone-500" />
          <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
            Aucune copropriete selectionnee
          </h3>
          <p className="mt-2 text-stone-500 dark:text-stone-400">
            Selectionnez une copropriete dans le menu lateral.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">Tickets</h2>
            <button
              onClick={() => {
                createForm.reset()
                setShowCreateDialog(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Nouveau ticket
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <MessageSquare className="h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-stone-500 dark:text-stone-400">Aucun ticket</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left dark:border-stone-700">
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Sujet</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Auteur</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Categorie</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Priorite</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Statut</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Messages</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400">Date</th>
                    <th className="px-4 py-3 font-medium text-stone-500 dark:text-stone-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: Ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer border-b border-stone-100 hover:bg-stone-50 dark:border-stone-700/50 dark:hover:bg-stone-800/30"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <td className="px-4 py-3 font-medium text-stone-900 dark:text-white">
                        {ticket.sujet}
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {ticket.auteur_nom ?? 'Inconnu'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_COLORS[ticket.categorie]}`}>
                          {CATEGORIE_LABELS[ticket.categorie]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITE_COLORS[ticket.priorite]}`}>
                          {PRIORITE_LABELS[ticket.priorite]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_COLORS[ticket.statut]}`}>
                          {STATUT_LABELS[ticket.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {ticket.messages_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingTicket(ticket)
                              setShowEditDialog(true)
                            }}
                            className="rounded p-1 text-stone-400 hover:text-emerald-700"
                            aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(ticket.id)}
                            className="rounded p-1 text-stone-400 hover:text-red-600"
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create dialog */}
      <FormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Nouveau ticket"
        description="Creer un nouveau ticket de support"
        form={createForm}
        onSubmit={handleCreate}
        isLoading={createTicket.isPending}
      >
        <FormSection icon={Info} label="Informations">
          <FormField
            control={createForm.control}
            name="sujet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sujet du ticket" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={createForm.control}
              name="categorie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorite</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PRIORITE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
      </FormDialog>

      {/* Edit dialog (list view) */}
      <FormDialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) setEditingTicket(null)
        }}
        title="Modifier le ticket"
        form={editForm}
        onSubmit={handleUpdate}
        isLoading={updateTicket.isPending}
      >
        <FormSection icon={Info} label="Informations">
          <FormField
            control={editForm.control}
            name="sujet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sujet du ticket" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={editForm.control}
              name="categorie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STATUT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="priorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorite</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PRIORITE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
      </FormDialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Confirmer la suppression"
        description="Cette action est irréversible."
        variant="destructive"
        onConfirm={() => {
          deleteTicket.mutate(deleteId!, {
            onSuccess: () => setSelectedTicketId(null),
          })
          setDeleteId(null)
        }}
      />
    </div>
  )
}
