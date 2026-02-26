'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Users, UserPlus, X, Copy, Check, Loader2, Shield, UserMinus, RefreshCw } from 'lucide-react'

interface TeamMember {
    id: string
    user_id: string
    added_at: string
    email: string
}

interface TeamInvite {
    id: string
    email: string
    status: string
    created_at: string
    expires_at: string
}

interface TeamStats {
    licenseId: string
    seats: number
    seatsUsed: number
    members: TeamMember[]
    invites: TeamInvite[]
    freeReassignmentsTotal: number
    freeReassignmentsUsed: number
}

export default function TeamDashboard() {
    const [teams, setTeams] = useState<TeamStats[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteResult, setInviteResult] = useState<{ url: string, message: string } | null>(null)
    const [error, setError] = useState('')
    const [removingMember, setRemovingMember] = useState<string | null>(null)

    const fetchTeams = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const res = await fetch('/api/team/dashboard', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setTeams(data.teams || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeams()
    }, [])

    const handleInvite = async (e: React.FormEvent, licenseId: string) => {
        e.preventDefault()
        setInviting(true)
        setError('')
        setInviteResult(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const res = await fetch('/api/team/invite/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    teamLicenseId: licenseId,
                    email: inviteEmail
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Errore creazione invito')
            }

            setInviteResult({
                url: data.debugUrl, // In prod, maybe just "Email sent"
                message: 'Invito creato con successo!'
            })
            setInviteEmail('')
            fetchTeams() // Refresh list

        } catch (e: any) {
            setError(e.message)
        } finally {
            setInviting(false)
        }
    }

    const handleRevoke = async (inviteId: string) => {
        if (!confirm('Sei sicuro di voler revocare questo invito?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const res = await fetch('/api/team/invite/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ inviteId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            fetchTeams() // Refresh
        } catch (e: any) {
            alert('Errore revoca: ' + e.message)
        }
    }

    const handleRemoveMember = async (memberId: string, memberEmail: string, licenseId: string) => {
        if (!confirm(`Sei sicuro di voler rimuovere ${memberEmail} dal team? Questo utilizzerà un riassegnamento.`)) return

        setRemovingMember(memberId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const res = await fetch('/api/team/remove-member', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ teamLicenseId: licenseId, memberId })
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.needsPayment) {
                    alert('Hai esaurito i riassegnamenti gratuiti. Contatta simonsilvercaldaie@gmail.com per acquistare nuovi riassegnamenti (€400 cad.)')
                } else {
                    throw new Error(data.error || 'Errore nella rimozione')
                }
                return
            }

            alert(`${memberEmail} rimosso dal team. Riassegnamenti gratuiti rimasti: ${data.freeRemaining}`)
            fetchTeams() // Refresh
        } catch (e: any) {
            alert('Errore: ' + e.message)
        } finally {
            setRemovingMember(null)
        }
    }

    if (loading) return null // Or simple loader
    if (!teams || teams.length === 0) return null // Don't show if not an owner

    return (
        <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users className="w-32 h-32 text-indigo-600" />
            </div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-100 relative z-10">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Gestione Team</h2>
                    <p className="text-sm text-gray-600">Gestisci i membri e le licenze della tua azienda</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {teams.map(team => (
                    <div key={team.licenseId} className="space-y-6">
                        {/* Stats Bar */}
                        <div className="bg-indigo-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div>
                                <h3 className="font-bold text-indigo-900">Licenza Aziendale</h3>
                                <p className="text-sm text-indigo-700">ID: {team.licenseId.slice(0, 8)}...</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-indigo-600">{team.seatsUsed} / {team.seats}</div>
                                    <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Posti Utilizzati</div>
                                </div>
                                <div className="text-center border-l border-indigo-200 pl-6">
                                    <div className="text-2xl font-bold text-amber-600">
                                        {Math.max(0, team.freeReassignmentsTotal - team.freeReassignmentsUsed)}
                                    </div>
                                    <div className="text-xs font-medium text-amber-500 uppercase tracking-wider">Riassegnamenti Gratis</div>
                                </div>
                            </div>
                        </div>

                        {/* Reassignment warning if exhausted */}
                        {team.freeReassignmentsUsed >= team.freeReassignmentsTotal && (
                            <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 flex-shrink-0" />
                                <span>Riassegnamenti gratuiti esauriti. Per rimuovere e sostituire un membro contatta <strong>simonsilvercaldaie@gmail.com</strong> (€400/riassegnamento).</span>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Invite Form */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Invita Collaboratore
                                </h4>

                                {team.seatsUsed >= team.seats ? (
                                    <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                                        Hai raggiunto il limite di posti. Contattaci per ampliare la licenza.
                                    </div>
                                ) : (
                                    <form onSubmit={(e) => handleInvite(e, team.licenseId)} className="space-y-3">
                                        <div>
                                            <input
                                                type="email"
                                                required
                                                placeholder="Email collaboratore..."
                                                value={inviteEmail}
                                                onChange={e => setInviteEmail(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={inviting || !inviteEmail}
                                            className="w-full py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Invito'}
                                        </button>
                                    </form>
                                )}

                                {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

                                {inviteResult && (
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                            <Check className="w-4 h-4" /> {inviteResult.message}
                                        </div>
                                        {/* DEBUG ONLY: Show URL */}
                                        <div className="text-xs text-gray-500 break-all p-2 bg-white rounded border border-gray-100 select-all font-mono">
                                            {inviteResult.url}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            (Copia il link se l'email non arriva)
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Members & Pending List */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Membri del Team
                                </h4>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {/* Active Members */}
                                    {team.members.map(m => (
                                        <div key={m.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">
                                                    {m.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{m.email}</div>
                                                    <div className="text-xs text-gray-500">Membro attivo</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(m.id, m.email, team.licenseId)}
                                                disabled={removingMember === m.id}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                title="Rimuovi membro"
                                            >
                                                {removingMember === m.id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <UserMinus className="w-4 h-4" />
                                                }
                                            </button>
                                        </div>
                                    ))}

                                    {/* Pending Invites */}
                                    {team.invites.map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 bg-yellow-50/50 rounded-lg border border-yellow-100 dashed">
                                            <div className="flex items-center gap-3 opacity-70">
                                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xs font-bold">
                                                    @
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{inv.email}</div>
                                                    <div className="text-xs text-yellow-600">In attesa...</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevoke(inv.id)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Revoca invito"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}

                                    {team.members.length === 0 && team.invites.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            Nessun membro. Inizia invitando qualcuno!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
