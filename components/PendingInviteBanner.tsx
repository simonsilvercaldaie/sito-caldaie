'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Mail, CheckCircle, Loader2, Users, X } from 'lucide-react'

interface PendingInvite {
    id: string
    teamLicenseId: string
    companyName: string
    ownerEmail: string
    seats: number
    createdAt: string
    expiresAt: string
}

export default function PendingInviteBanner() {
    const [invites, setInvites] = useState<PendingInvite[]>([])
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState<string | null>(null)
    const [accepted, setAccepted] = useState<string[]>([])

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/team/invite/pending', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            if (res.ok) {
                const data = await res.json()
                setInvites(data.invites || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (inviteId: string) => {
        setAccepting(inviteId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Sessione scaduta')

            const res = await fetch('/api/team/invite/accept-by-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ inviteId })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Errore')
                return
            }

            setAccepted(prev => [...prev, inviteId])
            // Reload page after short delay to refresh dashboard
            setTimeout(() => window.location.reload(), 1500)

        } catch (e: any) {
            alert('Errore: ' + e.message)
        } finally {
            setAccepting(null)
        }
    }

    if (loading || invites.length === 0) return null

    const pendingInvites = invites.filter(inv => !accepted.includes(inv.id))
    if (pendingInvites.length === 0) return null

    return (
        <div className="space-y-3">
            {pendingInvites.map(inv => (
                <div
                    key={inv.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm animate-fade-in"
                >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-indigo-900 text-lg">
                            📩 Hai un invito Team!
                        </h3>
                        <p className="text-indigo-700 text-sm mt-1">
                            <strong>{inv.ownerEmail}</strong> ti ha invitato ad accedere ai corsi tramite la licenza aziendale
                            {inv.companyName !== inv.ownerEmail && <> di <strong>{inv.companyName}</strong></>}.
                        </p>
                        <p className="text-xs text-indigo-500 mt-1">
                            Accettando otterrai accesso completo a tutti i contenuti Premium.
                        </p>
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                        {accepted.includes(inv.id) ? (
                            <div className="flex items-center gap-2 text-green-600 font-bold py-3 px-6">
                                <CheckCircle className="w-5 h-5" />
                                Accettato!
                            </div>
                        ) : (
                            <button
                                onClick={() => handleAccept(inv.id)}
                                disabled={accepting === inv.id}
                                className="w-full md:w-auto py-3 px-8 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {accepting === inv.id
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Accettazione...</>
                                    : <><Users className="w-4 h-4" /> Accetta Invito</>
                                }
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
