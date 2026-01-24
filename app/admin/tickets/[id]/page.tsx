'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, ArrowLeft, Send, CheckCircle, User, Bot, Clock } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

export default function AdminTicketPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const [loading, setLoading] = useState(true)
    const [ticket, setTicket] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (id) fetchTicket()
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchTicket = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            window.location.href = '/login'
            return
        }

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTicket(data.ticket)
                setMessages(data.messages || [])
            } else {
                alert('Errore caricamento ticket o accesso negato')
                router.push('/admin')
            }
        } catch (e) {
            console.error(e)
            alert('Errore di rete')
        } finally {
            setLoading(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim()) return

        setSending(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ message: reply })
            })

            if (res.ok) {
                setReply('')
                fetchTicket() // Refresh to see new message and status update
            } else {
                alert('Errore invio messaggio')
            }
        } finally {
            setSending(false)
        }
    }

    const handleCloseTicket = async () => {
        if (!confirm('Chiudere questo ticket?')) return
        setSending(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status: 'closed' })
            })

            if (res.ok) {
                fetchTicket()
            } else {
                alert('Errore chiusura ticket')
            }
        } finally {
            setSending(false)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
        </div>
    )

    if (!ticket) return null

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold">Torna alla Dashboard</span>
                    </button>
                    {ticket.status !== 'closed' && (
                        <button
                            onClick={handleCloseTicket}
                            disabled={sending}
                            className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Chiudi Ticket
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
                    {/* TICKET INFO HEADER */}
                    <div className="bg-slate-50 border-b border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${ticket.status === 'closed' ? 'bg-gray-200 text-gray-600' :
                                    ticket.status.includes('admin') ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(ticket.created_at).toLocaleString()}
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-800 mb-2">{ticket.subject}</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <User className="w-4 h-4" />
                            Ticket ID: <span className="font-mono text-xs bg-slate-200 px-1 rounded">{ticket.id.split('-')[0]}...</span>
                        </div>
                    </div>

                    {/* MESSAGES AREA */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm italic">Nessun messaggio.</p>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.is_admin
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                                            {msg.is_admin ? (
                                                <Bot className="w-4 h-4" />
                                            ) : (
                                                <User className="w-4 h-4" />
                                            )}
                                            <span className="text-xs font-bold opacity-80">
                                                {msg.is_admin ? 'Admin (Tu)' : 'Utente'}
                                            </span>
                                            <span className="text-[10px] opacity-60 ml-auto">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* COMPOSER */}
                    {ticket.status !== 'closed' ? (
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSend} className="flex gap-4">
                                <input
                                    type="text"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Scrivi una risposta..."
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !reply.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-gray-500 font-bold text-sm">
                            Questo ticket è chiuso.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
