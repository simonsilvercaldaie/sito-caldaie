'use client'
import { useState, useEffect, useRef } from 'react'
import { Loader2, Send, Plus, MessageSquare, ChevronLeft } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Ticket {
    id: string
    subject: string
    status: 'open' | 'closed' | 'pending'
    created_at: string
    updated_at: string
}

interface Message {
    id: string
    message: string
    is_admin: boolean
    created_at: string
}

export default function SupportSection({ userEmail }: { userEmail: string }) {
    const [view, setView] = useState<'list' | 'new' | 'chat'>('list')
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)

    // New Ticket State
    const [newSubject, setNewSubject] = useState('')
    const [newMsg, setNewMsg] = useState('')

    // Chat State
    const [chatInput, setChatInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (view === 'list') fetchTickets()
    }, [view])

    useEffect(() => {
        if (activeTicket && view === 'chat') {
            fetchMessages(activeTicket.id)
            // Optional: polling o realtime subscription qui
        }
    }, [activeTicket, view])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchTickets = async () => {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/tickets', {
                headers: { 'Authorization': `Bearer ${session?.access_token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTickets(data.tickets || [])
            }
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (ticketId: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`/api/tickets/${ticketId}`, {
            headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setMessages(data.messages || [])
        }
    }

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ subject: newSubject, initialMessage: newMsg })
            })

            if (res.ok) {
                setNewSubject('')
                setNewMsg('')
                setView('list')
            } else {
                alert('Errore creazione ticket')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || !activeTicket) return

        const tempMsg = chatInput
        setChatInput('') // Optimistic clear

        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch(`/api/tickets/${activeTicket.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ message: tempMsg })
            })

            if (res.ok) {
                fetchMessages(activeTicket.id)
            } else {
                setChatInput(tempMsg) // Restore on error
                alert('Errore invio messaggio')
            }
        } catch {
            setChatInput(tempMsg)
        }
    }

    // --- VIEWS ---

    if (view === 'new') {
        return (
            <div className="space-y-4">
                <button onClick={() => setView('list')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Torna ai ticket
                </button>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-lg mb-4">Nuova Richiesta di Supporto</h3>
                    <form onSubmit={handleCreateTicket} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Oggetto</label>
                            <input
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Es. Problema col video Caldaie..."
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Messaggio</label>
                            <textarea
                                className="w-full border rounded-lg p-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Descrivi il problema..."
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invia Richiesta'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    if (view === 'chat' && activeTicket) {
        return (
            <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('list')} className="p-1 hover:bg-gray-200 rounded-full" aria-label="Torna alla lista">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h3 className="font-bold text-gray-900">{activeTicket.subject}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${activeTicket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {activeTicket.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.is_admin ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${m.is_admin
                                ? 'bg-white border border-gray-100 text-gray-800'
                                : 'bg-indigo-600 text-white'
                                }`}>
                                <p className="whitespace-pre-wrap">{m.message}</p>
                                <div className={`text-[10px] mt-1 ${m.is_admin ? 'text-gray-400' : 'text-indigo-200'}`}>
                                    {new Date(m.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Scrivi un messaggio..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            disabled={activeTicket.status === 'closed'}
                        />
                        <button
                            type="submit"
                            disabled={!chatInput.trim() || activeTicket.status === 'closed'}
                            title="Invia messaggio"
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    {activeTicket.status === 'closed' && (
                        <p className="text-xs text-center text-gray-500 mt-2">Questo ticket è chiuso</p>
                    )}
                </div>
            </div>
        )
    }

    // LIST VIEW
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Assistenza Dedicata</h2>
                    <p className="text-sm text-gray-500">Parla direttamente con lo staff tecnico</p>
                </div>
                <button
                    onClick={() => setView('new')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Apri Ticket
                </button>
            </div>

            {loading && tickets.length === 0 ? (
                <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-200" /></div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nessuna richiesta di supporto</p>
                    <p className="text-sm text-gray-400">Tutto funziona bene? Ottimo!</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => { setActiveTicket(ticket); setView('chat') }}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors`}>
                                    <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{ticket.subject}</h4>
                                    <p className="text-xs text-gray-500">Aggiornato: {new Date(ticket.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {ticket.status}
                                </span>
                                <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
