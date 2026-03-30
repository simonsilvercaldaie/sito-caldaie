'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Users, UserPlus, X, Check, Loader2, Shield, UserMinus, RefreshCw, Edit2, Save, Award, BarChart3, Download } from 'lucide-react'

interface TeamMember {
    id: string
    user_id: string
    added_at: string
    email: string
    display_name: string | null
    completedCount: number
    totalCourses: number
    totalMinutes: number
    completedAll: boolean
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
    companyName: string
    seats: number
    seatsUsed: number
    members: TeamMember[]
    invites: TeamInvite[]
    maxInvites: number
    invitesUsed: number
    invitesRemaining: number
}

export default function TeamDashboard({ initialData }: { initialData?: any }) {
    const [teams, setTeams] = useState<TeamStats[]>(initialData?.teams || [])
    const [loading, setLoading] = useState(!initialData)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [inviteResult, setInviteResult] = useState<{ url: string, message: string } | null>(null)
    const [error, setError] = useState('')
    const [removingMember, setRemovingMember] = useState<string | null>(null)
    const [editingName, setEditingName] = useState<string | null>(null)
    const [editNameValue, setEditNameValue] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [downloadingCert, setDownloadingCert] = useState<string | null>(null)

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
        if (!initialData) {
            fetchTeams()
        }
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
                url: data.debugUrl,
                message: 'Invito creato con successo!'
            })
            setInviteEmail('')
            fetchTeams()

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

            fetchTeams()
        } catch (e: any) {
            alert('Errore revoca: ' + e.message)
        }
    }

    const handleRemoveMember = async (memberId: string, memberEmail: string, licenseId: string) => {
        if (!confirm(`Sei sicuro di voler rimuovere ${memberEmail} dalla licenza aziendale? Il posto verrà liberato.`)) return

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
                throw new Error(data.error || 'Errore nella rimozione')
            }

            alert(`${memberEmail} rimosso dalla licenza. Il posto è ora disponibile.`)
            fetchTeams()
        } catch (e: any) {
            alert('Errore: ' + e.message)
        } finally {
            setRemovingMember(null)
        }
    }

    const handleSaveName = async (memberId: string, licenseId: string) => {
        setSavingName(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const res = await fetch('/api/team/dashboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    action: 'update_member_name',
                    memberId,
                    displayName: editNameValue.trim(),
                    teamLicenseId: licenseId
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            setEditingName(null)
            fetchTeams()
        } catch (e: any) {
            alert('Errore: ' + e.message)
        } finally {
            setSavingName(false)
        }
    }

    const handleDownloadCertificate = async (memberId: string, licenseId: string, memberName: string) => {
        setDownloadingCert(memberId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error("No session")

            const res = await fetch('/api/team/certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ memberId, teamLicenseId: licenseId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Certificato_${memberName.replace(/\s+/g, '_')}.pdf`
            a.click()
            URL.revokeObjectURL(url)
        } catch (e: any) {
            alert('Errore: ' + e.message)
        } finally {
            setDownloadingCert(null)
        }
    }

    if (loading) return null
    if (!teams || teams.length === 0) return null

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
                    <h2 className="text-xl font-bold text-gray-900">Gestione Licenza Aziendale (Multidipendente)</h2>
                    <p className="text-sm text-gray-600">Gestisci i membri e monitora i progressi di formazione</p>
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
                                    <div className="text-xs font-medium text-indigo-400 uppercase tracking-wider">Posti Attivi</div>
                                </div>
                                <div className="text-center border-l border-indigo-200 pl-6">
                                    <div className="text-2xl font-bold text-amber-600">
                                        {team.invitesRemaining}
                                    </div>
                                    <div className="text-xs font-medium text-amber-500 uppercase tracking-wider">Inviti Rimasti</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Invite Form */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Invita Collaboratore
                                </h4>

                                {team.invitesRemaining <= 0 ? (
                                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-center">
                                        <p className="mb-4 text-sm font-medium">
                                            Hai esaurito gli inviti a tua disposizione. Per continuare ad invitare collaboratori devi acquistare un nuovo invito.
                                        </p>
                                        <a 
                                            href="/acquista-inviti-extra" 
                                            className="inline-block w-full py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-200"
                                        >
                                            Acquista 1 Nuovo Invito — €400
                                        </a>
                                    </div>
                                ) : team.seatsUsed >= team.seats ? (
                                    <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100">
                                        Tutti i posti attivi sono occupati. Per invitare un nuovo collaboratore devi prima rimuoverne uno esistente.
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
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                            <Check className="w-4 h-4" /> {inviteResult.message}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            L&apos;invitato troverà l&apos;invito nella propria Area Personale dopo il login.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Members & Pending List */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Membri Autorizzati
                                </h4>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {/* Active Members with Progress */}
                                    {team.members.map(m => (
                                        <div key={m.user_id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${m.completedAll ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {m.completedAll ? '✓' : m.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        {/* Editable Name */}
                                                        {editingName === m.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <input
                                                                    type="text"
                                                                    value={editNameValue}
                                                                    onChange={e => setEditNameValue(e.target.value)}
                                                                    placeholder="Nome e Cognome"
                                                                    className="px-2 py-1 text-sm border border-indigo-300 rounded-lg w-40 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveName(m.id, team.licenseId)}
                                                                    disabled={savingName}
                                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                                >
                                                                    {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                                </button>
                                                                <button onClick={() => setEditingName(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {m.display_name || m.email}
                                                                </span>
                                                                <button
                                                                    onClick={() => { setEditingName(m.id); setEditNameValue(m.display_name || '') }}
                                                                    className="p-0.5 text-gray-300 hover:text-indigo-600 rounded"
                                                                    title="Modifica nome"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {m.display_name && (
                                                            <div className="text-xs text-gray-400">{m.email}</div>
                                                        )}
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

                                            {/* Progress Bar */}
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-medium text-gray-500 flex items-center gap-1">
                                                        <BarChart3 className="w-3 h-3" />
                                                        {m.completedCount}/{m.totalCourses} video • {m.totalMinutes} min
                                                    </span>
                                                    <span className={`font-bold ${m.completedAll ? 'text-green-600' : m.completedCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                        {Math.round((m.completedCount / m.totalCourses) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${m.completedAll ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                                        style={{ width: `${(m.completedCount / m.totalCourses) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Certificate Button */}
                                            {m.completedAll && m.display_name && (
                                                <button
                                                    onClick={() => handleDownloadCertificate(m.id, team.licenseId, m.display_name!)}
                                                    disabled={downloadingCert === m.id}
                                                    className="mt-3 w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200 disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
                                                >
                                                    {downloadingCert === m.id
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : <><Award className="w-4 h-4" /> Scarica Certificato PDF</>
                                                    }
                                                </button>
                                            )}
                                            {m.completedAll && !m.display_name && (
                                                <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                                                    <Edit2 className="w-3 h-3" />
                                                    Inserisci Nome e Cognome per generare il certificato
                                                </div>
                                            )}
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
