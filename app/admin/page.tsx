'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, AlertTriangle, UserX, ShieldAlert, RefreshCw, MonitorX, Search, X, ChevronDown, ChevronUp, FileText, Shield, Clock, Users } from 'lucide-react'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [tickets, setTickets] = useState<any[]>([])
    const [liveUsers, setLiveUsers] = useState<number>(0)
    const [teams, setTeams] = useState<any[]>([])
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        checkAuth()
        const ping = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                fetch('/api/heartbeat', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                }).catch(() => { })
            }
        }
        ping()
        const t = setInterval(ping, 60000)
        return () => clearInterval(t)
    }, [])

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            window.location.href = '/login'
            return
        }

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ action: 'get_stats' })
            })

            if (res.ok) {
                const data = await res.json()
                setStats(data)
                setAuthorized(true)
                Promise.all([
                    fetchOrders(session.access_token),
                    fetchTickets(session.access_token),
                    fetchLiveUsers(session.access_token),
                    fetchTeams(session.access_token)
                ])
            } else {
                setAuthorized(false)
            }
        } catch (e) {
            console.error(e)
            setAuthorized(false)
        } finally {
            setLoading(false)
        }
    }

    const fetchOrders = async (token: string) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'get_orders' })
        })
        if (res.ok) {
            const data = await res.json()
            setOrders(data.orders || [])
        }
    }

    const fetchTickets = async (token: string) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'get_tickets' })
        })
        if (res.ok) {
            const data = await res.json()
            setTickets(data.tickets || [])
        }
    }

    const fetchLiveUsers = async (token: string) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'get_live_users' })
        })
        if (res.ok) {
            const data = await res.json()
            setLiveUsers(data.count || 0)
        }
    }

    const fetchTeams = async (token: string) => {
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action: 'get_teams' })
        })
        if (res.ok) {
            const data = await res.json()
            setTeams(data.teams || [])
        }
    }

    const handleResetDevices = async (userId: string) => {
        if (!confirm('SEI SICURO? Questo resetterà tutti i dispositivi dell\'utente e lo costringerà a rifare il login.')) return
        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'reset_devices', userId })
            })
            if (res.ok) alert('Dispositivi resettati.')
            else alert('Errore reset.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleUpdateTeamLimits = async (teamId: string, seats: number, maxInvites: number) => {
        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'update_team_seats', teamId, seats, maxInvites })
            })
            if (res.ok) {
                alert('Limiti Team aggiornati.')
                fetchTeams(session!.access_token)
            } else {
                alert('Errore aggiornamento limiti.')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteTeam = async (teamId: string, companyName: string) => {
        if (!confirm(`SEI SICURO? Vuoi davvero ELIMINARE la licenza Team "${companyName}"? Questa azione revocherà l'accesso a tutti i membri.`)) return
        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'delete_team', teamId })
            })
            if (res.ok) {
                alert('Licenza Team eliminata con successo.')
                fetchTeams(session!.access_token)
            } else {
                alert('Errore eliminazione Team.')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleRevoke = async (userId: string) => {
        if (!confirm('SEI SICURO? Questo eliminerà gli acquisti dell\'utente e lo disconnetterà immediatamente.')) return
        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'revoke_user', userId, reason: 'Manual Admin Revocation' })
            })
            if (res.ok) {
                alert('Utente revocato.')
                fetchOrders(session!.access_token)
            } else {
                alert('Errore revoca.')
            }
        } finally {
            setActionLoading(false)
        }
    }

    const handleWarning = async (email: string) => {
        if (!confirm(`Inviare email di avviso a ${email}?`)) return
        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'send_warning', email, reason: 'Abuse detected' })
            })
            if (res.ok) alert('Email inviata.')
            else alert('Errore invio.')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>

    if (!authorized) return (
        <div className="p-10 text-center text-red-600 font-bold">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            ACCESSO NEGATO. Questa pagina è riservata agli amministratori.
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                        <a href="/" className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-bold shadow-sm transition-colors">
                            🏠 Home
                        </a>
                        <a href="/admin/statistiche-video" className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 text-xs font-bold shadow-sm transition-colors flex items-center gap-2">
                            📺 Statistiche Video
                        </a>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Build: ADMIN-USERCARD-AUDIT-01</p>
                </div>
                <button onClick={() => window.location.reload()} className="p-2 bg-white rounded-lg shadow-sm hover:shadow">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                </button>
            </header>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Utenti Totali</div>
                    <div className="text-3xl font-extrabold text-slate-800 mt-2">{stats?.totalUsers || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Ordini Totali</div>
                    <div className="text-3xl font-extrabold text-blue-600 mt-2">{stats?.totalOrders || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
                        Utenti Online (15m) <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    <div className="text-3xl font-extrabold text-green-600 mt-2">{liveUsers}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Minacce Rilevate</div>
                    <div className="text-3xl font-extrabold text-red-600 mt-2">{stats?.securityEvents?.length || 0}</div>
                </div>
            </div>

            {/* USER CARD SEARCH */}
            <UserCardSearch />

            {/* DIRECTORY TUTTI GLI UTENTI ATTIVI */}
            <UserDirectory />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: TICKETS & GRANT ACCESS */}
                <div className="lg:col-span-1 space-y-6">
                    {/* TICKETS LIST */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                            <h2 className="font-bold text-lg text-slate-800">Supporto Clienti</h2>
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                                {tickets.filter(t => t.status === 'open' || t.status === 'replied_user').length} Aperti
                            </span>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {tickets.length === 0 ? (
                                <p className="p-6 text-center text-gray-500 text-sm">Nessun ticket presente.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {tickets.map(ticket => (
                                        <li key={ticket.id}>
                                            <a href={`/admin/tickets/${ticket.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        ticket.status === 'replied_user' ? 'bg-blue-100 text-blue-700' :
                                                            ticket.status === 'replied_admin' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(ticket.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800 mb-1">{ticket.subject}</h3>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {ticket.user?.email || 'Utente sconosciuto'}
                                                </p>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <GrantAccessForm />
                    <ResetDevicesForm />

                    {/* SECURITY LOGS */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-fit">
                        <div className="p-6 border-b border-slate-100 pb-4">
                            <h2 className="font-bold text-lg text-slate-800">Eventi di Sicurezza</h2>
                        </div>
                        <div className="p-0">
                            {stats?.securityEvents?.length === 0 ? (
                                <p className="p-6 text-gray-400 text-sm text-center">Nessun evento rilevato.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                                    {stats?.securityEvents?.map((event: any) => (
                                        <li key={event.id} className="p-4 hover:bg-red-50/10 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-mono text-gray-400">
                                                    {new Date(event.created_at).toLocaleString()}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${event.event_type.includes('blocked') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {event.event_type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-700 font-medium break-all">
                                                User: {event.user_id}
                                            </p>
                                            {event.metadata && (
                                                <p className="text-[10px] text-gray-500 mt-1 bg-slate-50 p-1 rounded font-mono">
                                                    {JSON.stringify(event.metadata)}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ORDERS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 pb-4">
                            <h2 className="font-bold text-lg">Ultimi Ordini</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-semibold">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Utente</th>
                                        <th className="p-4">Prodotto</th>
                                        <th className="p-4">Importo</th>
                                        <th className="p-4 text-right">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-slate-900">
                                                {order.user?.email || 'N/A'}
                                                {order.snapshot_company_name && (
                                                    <span className="block text-xs text-indigo-600 font-bold mt-1">
                                                        {order.snapshot_company_name} (P.IVA)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                    {order.product_code || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono">€{(order.amount_cents / 100).toFixed(2)}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleWarning(order.user?.email)}
                                                    disabled={actionLoading}
                                                    title="Invia Avviso Pre-Blocco"
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-200"
                                                >
                                                    <ShieldAlert className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetDevices(order.user_id)}
                                                    disabled={actionLoading}
                                                    title="FORZA RESET DISPOSITIVI"
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                                                >
                                                    <MonitorX className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRevoke(order.user_id)}
                                                    disabled={actionLoading}
                                                    title="REVOCA LICENZA (Irreversibile)"
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEAM LICENSES */}
            <div className="grid grid-cols-1 mt-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-slate-800">Gestione Licenze Team</h2>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
                            {teams.length} Team Attivi
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold">
                                <tr>
                                    <th className="p-4">Data Creazione</th>
                                    <th className="p-4">Azienda (Proprietario)</th>
                                    <th className="p-4 text-center">Posti (Occupati/Max)</th>
                                    <th className="p-4 text-center">Inviti (Usati/Max)</th>
                                    <th className="p-4 text-right">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teams.map((team: any) => (
                                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 text-gray-500 font-mono text-xs">{new Date(team.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 font-medium text-slate-900">
                                            {team.company_name || 'Sconosciuta'}
                                            <span className="block text-xs text-gray-500 font-normal mt-0.5">
                                                {team.owner_email}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${team.active_members_count >= team.seats ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                {team.active_members_count} / {team.seats}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${(team.invites_used || 0) >= (team.max_invites_total || 0) ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                {team.invites_used || 0} / {team.max_invites_total || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center justify-end gap-3">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 w-12 text-right">Posti:</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={team.seats}
                                                        min={1}
                                                        name={`seats-${team.id}`}
                                                        aria-label="Posti Totali"
                                                        className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 w-12 text-right">Inviti:</span>
                                                    <input
                                                        type="number"
                                                        defaultValue={team.max_invites_total || 0}
                                                        min={1}
                                                        name={`invites-${team.id}`}
                                                        aria-label="Max Inviti Totali"
                                                        className="w-16 p-1 border border-slate-300 rounded text-center text-xs font-bold text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => {
                                                        const seatsVal = (document.querySelector(`input[name="seats-${team.id}"]`) as HTMLInputElement).value;
                                                        const invitesVal = (document.querySelector(`input[name="invites-${team.id}"]`) as HTMLInputElement).value;
                                                        handleUpdateTeamLimits(team.id, parseInt(seatsVal, 10), parseInt(invitesVal, 10));
                                                    }}
                                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded shadow-sm transition-colors disabled:opacity-50"
                                                >
                                                    Salva
                                                </button>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleDeleteTeam(team.id, team.company_name || 'Sconosciuta')}
                                                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold rounded shadow-sm transition-colors disabled:opacity-50"
                                                    title="Elimina Licenza Team"
                                                >
                                                    Elimina
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400">Nessun team trovato.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    )
}

// ===================================================================
// USER DIRECTORY — List all active users
// ===================================================================
function UserDirectory() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const fetchDirectory = async () => {
        if (users.length > 0) {
            setExpanded(!expanded)
            return
        }
        setExpanded(true)
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'get_active_users_list' })
            })
            if (res.ok) setUsers(await res.json())
        } catch { 
            alert('Errore caricamento lista utenti')
        } finally { setLoading(false) }
    }

    return (
        <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center cursor-pointer" onClick={fetchDirectory}>
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Directory Utenti Attivi ({users.length > 0 ? users.length : 'Clicca per caricare'})
                    </h2>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                {expanded && users.length > 0 && (
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-4">Email / Nome</th>
                                    <th className="p-4">ID Formato</th>
                                    <th className="p-4">Livelli Sbloccati</th>
                                    <th className="p-4 flex-wrap">Fonti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map(u => (
                                    <tr key={u.user_id} className="hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{u.email}</div>
                                            <div className="text-xs text-slate-500">{u.name}</div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-400">{u.user_id.slice(0, 12)}...</td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {u.access_levels.map((l: string) => (
                                                    <span key={l} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {l}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {u.sources.map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

// ===================================================================
// USER CARD SEARCH — Complete user profile lookup
// ===================================================================
function UserCardSearch() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [card, setCard] = useState<any>(null)
    const [error, setError] = useState('')
    const [expanded, setExpanded] = useState(true)
    const [noteText, setNoteText] = useState('')
    const [noteLoading, setNoteLoading] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!email) return
        setLoading(true)
        setError('')
        setCard(null)
        const { data: { session } } = await supabase.auth.getSession()
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
                body: JSON.stringify({ action: 'get_user_card', email })
            })
            const data = await res.json()
            if (res.ok) setCard(data)
            else setError(data.error || 'Errore')
        } catch { setError('Errore di rete') }
        finally { setLoading(false) }
    }

    const handleRevokeLevel = async (userId: string, level: string) => {
        const reason = prompt(`Motivo revoca "${level}":`)
        if (!reason) return
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'admin_revoke_access', userId, levels: [level], reason })
        })
        if (res.ok) { alert('Revocato!'); handleSearch() }
        else alert('Errore revoca')
    }

    const handleGrantLevel = async (userId: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        const levels = prompt('Livelli da sbloccare (separati da virgola, es: base,intermedio,avanzato):')
        if (!levels) return
        const products = levels.split(',').map(l => l.trim())
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'grant_access', email: card.user.email, products })
        })
        if (res.ok) { alert('Accesso concesso!'); handleSearch() }
        else alert('Errore grant')
    }

    const handleResetDevices = async (userId: string) => {
        if (!confirm('Sei sicuro? Reset dispositivi e sessioni.')) return
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'reset_devices', userId })
        })
        if (res.ok) { alert('Dispositivi resettati!'); handleSearch() }
        else alert('Errore reset')
    }

    const handleResetVideo = async (userId: string) => {
        if (!confirm('Sei sicuro? Questo cancellerà tutti i minuti di visualizzazione video e i completamenti di questo utente. IRREVERSIBILE.')) return
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'admin_reset_video_progress', userId })
        })
        if (res.ok) { alert('Statistiche Video Azzerate!'); handleSearch() }
        else alert('Errore reset video')
        setLoading(false)
    }

    const handleAddNote = async () => {
        if (!noteText || !card) return
        setNoteLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ action: 'admin_add_note', userId: card.user.id, note: noteText })
        })
        if (res.ok) { setNoteText(''); handleSearch() }
        else alert('Errore salvataggio nota')
        setNoteLoading(false)
    }

    return (
        <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
                    <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-indigo-600" />
                        Scheda Utente
                    </h2>
                    {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>

                {expanded && (
                    <div className="p-6">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Cerca per email utente..."
                                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-slate-900 bg-white"
                            />
                            <button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Cerca
                            </button>
                            {card && (
                                <button type="button" onClick={() => { setCard(null); setEmail('') }} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </form>

                        {error && <p className="text-red-600 text-sm font-bold mb-4">{error}</p>}

                        {/* User Card Result */}
                        {card && (
                            <div className="space-y-6">
                                {/* ANOMALIE */}
                                {card.anomalies?.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <h3 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Anomalie Rilevate
                                        </h3>
                                        <ul className="text-xs text-red-600 space-y-1">
                                            {card.anomalies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Row 1: Profile + Quick Actions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* PROFILO */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Profilo</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-mono font-bold text-slate-800">{card.user.email}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">ID</span><span className="font-mono text-xs text-slate-600">{card.user.id.slice(0, 12)}...</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Provider</span><span className="font-bold text-slate-700">{card.user.provider}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Registrato</span><span className="text-slate-700">{new Date(card.user.created_at).toLocaleDateString()}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Ultimo Login</span><span className="text-slate-700">{card.user.last_sign_in_at ? new Date(card.user.last_sign_in_at).toLocaleString() : 'Mai'}</span></div>
                                            {card.profile && (
                                                <>
                                                    <div className="flex justify-between"><span className="text-slate-500">Nome</span><span className="text-slate-700">{card.profile.full_name || '-'}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-500">Profilo Completo</span><span className={card.profile.profile_completed ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{card.profile.profile_completed ? 'SÌ' : 'NO'}</span></div>
                                                </>
                                            )}
                                            {card.billing && (
                                                <>
                                                    <div className="flex justify-between"><span className="text-slate-500">Azienda</span><span className="text-slate-700">{card.billing.company_name || '-'}</span></div>
                                                    <div className="flex justify-between"><span className="text-slate-500">P.IVA</span><span className="font-mono text-slate-700">{card.billing.vat_number || '-'}</span></div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* AZIONI RAPIDE */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Azioni Rapide</h3>
                                        <div className="space-y-3">
                                            <button onClick={() => handleGrantLevel(card.user.id)} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                                <Shield className="w-4 h-4" /> Grant Accesso
                                            </button>
                                            <button onClick={() => handleResetDevices(card.user.id)} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                                <MonitorX className="w-4 h-4" /> Reset Dispositivi
                                            </button>
                                            <button onClick={() => handleResetVideo(card.user.id)} className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                                <Clock className="w-4 h-4" /> Azzera Minuti Video
                                            </button>
                                        </div>

                                        {/* Online status */}
                                        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Stato Online</div>
                                            {card.presence ? (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span className="text-green-700 font-bold">Online</span>
                                                    <span className="text-slate-400 text-xs">— {new Date(card.presence.last_seen_at).toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-slate-400">Offline</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: Purchases + Access */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* ACQUISTI */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Acquisti ({card.purchases.length})</h3>
                                        {card.purchases.length === 0 ? (
                                            <p className="text-sm text-slate-400">Nessun acquisto</p>
                                        ) : (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {card.purchases.map((p: any) => (
                                                    <div key={p.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">{p.product_code}</span>
                                                            <span className="font-mono text-slate-600">€{(p.amount_cents / 100).toFixed(2)}</span>
                                                        </div>
                                                        <div className="text-slate-500 mt-1">{new Date(p.created_at).toLocaleString()}</div>
                                                        <div className="font-mono text-[10px] text-slate-400 mt-1 break-all">capture: {p.paypal_capture_id?.slice(0, 20)}...</div>
                                                        {p.snapshot_company_name === 'REGALO ADMIN' && (
                                                            <span className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">REGALO ADMIN</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* ACCESSI ATTIVI */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Accessi Attivi ({card.access.length})</h3>
                                        {card.access.length === 0 ? (
                                            <p className="text-sm text-slate-400">Nessun accesso</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {card.access.map((a: any) => (
                                                    <div key={a.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                                                        <div>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.access_level === 'base' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                                a.access_level === 'intermedio' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                                                    'bg-purple-50 text-purple-700 border border-purple-200'
                                                                }`}>{a.access_level.toUpperCase()}</span>
                                                            <span className="text-[10px] text-slate-400 ml-2">via {a.source}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRevokeLevel(card.user.id, a.access_level)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title={`Revoca ${a.access_level}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 3: Devices + Sessions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* DISPOSITIVI */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Dispositivi ({card.devices.length})</h3>
                                        {card.devices.length === 0 ? (
                                            <p className="text-sm text-slate-400">Nessun dispositivo</p>
                                        ) : (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {card.devices.map((d: any) => (
                                                    <div key={d.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                                        <div className="font-bold text-slate-700">{d.device_name || 'Dispositivo sconosciuto'}</div>
                                                        <div className="text-slate-400 font-mono mt-1 text-[10px]">FP: {d.fingerprint?.slice(0, 16)}...</div>
                                                        <div className="text-slate-400 mt-1">Creato: {new Date(d.created_at).toLocaleString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* SESSIONI */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Sessioni Attive ({card.sessions.length})</h3>
                                        {card.sessions.length === 0 ? (
                                            <p className="text-sm text-slate-400">Nessuna sessione</p>
                                        ) : (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {card.sessions.map((s: any) => (
                                                    <div key={s.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-500">Last Seen</span>
                                                            <span className="text-slate-700 font-mono">{new Date(s.last_seen_at).toLocaleString()}</span>
                                                        </div>
                                                        <div className="text-slate-400 font-mono mt-1 text-[10px]">ID: {s.id.slice(0, 12)}...</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 4: Team Info */}
                                {(card.teamOwnership.length > 0 || card.teamMembership.length > 0) && (
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Team</h3>
                                        {card.teamOwnership.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-xs text-indigo-600 font-bold uppercase mb-2">👑 Owner di:</div>
                                                {card.teamOwnership.map((t: any) => (
                                                    <div key={t.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs mb-2">
                                                        <div className="font-bold text-slate-700">{t.company_name || 'Team'}</div>
                                                        <div className="text-slate-500 mt-1">Seats: {t.seats} | Max Inviti: {t.max_invites_total || 'N/A'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {card.teamMembership.length > 0 && (
                                            <div>
                                                <div className="text-xs text-slate-600 font-bold uppercase mb-2">👤 Membro di:</div>
                                                {card.teamMembership.map((m: any) => (
                                                    <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs mb-2">
                                                        <div className="font-bold text-slate-700">{m.team_license?.company_name || 'Team'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Row 5: Notes + Security Events */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* NOTE ASSISTENZA */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Note Assistenza
                                        </h3>
                                        <div className="flex gap-2 mb-3">
                                            <input
                                                type="text"
                                                value={noteText}
                                                onChange={e => setNoteText(e.target.value)}
                                                placeholder="Scrivi una nota..."
                                                className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 bg-white"
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                disabled={noteLoading || !noteText}
                                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                                            >
                                                {noteLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salva'}
                                            </button>
                                        </div>
                                        {card.notes.length === 0 ? (
                                            <p className="text-xs text-slate-400">Nessuna nota</p>
                                        ) : (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {card.notes.map((n: any) => (
                                                    <div key={n.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                                        <div className="text-slate-700">{n.note}</div>
                                                        <div className="text-slate-400 mt-1 flex justify-between">
                                                            <span>{n.admin_email}</span>
                                                            <span>{new Date(n.created_at).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* EVENTI RECENTI */}
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                        <h3 className="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Eventi Recenti
                                        </h3>
                                        {card.securityEvents.length === 0 ? (
                                            <p className="text-xs text-slate-400">Nessun evento</p>
                                        ) : (
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {card.securityEvents.map((ev: any) => (
                                                    <div key={ev.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                                        <div className="flex justify-between items-start">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${ev.event_type.includes('blocked') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                                                {ev.event_type}
                                                            </span>
                                                            <span className="text-slate-400 text-[10px]">{new Date(ev.created_at).toLocaleString()}</span>
                                                        </div>
                                                        {ev.metadata && (
                                                            <div className="text-[10px] text-slate-500 mt-1 font-mono bg-slate-50 p-1 rounded break-all">
                                                                {JSON.stringify(ev.metadata).slice(0, 120)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function GrantAccessForm() {
    const [email, setEmail] = useState('')
    const [selected, setSelected] = useState<string[]>(['base', 'intermedio', 'avanzato'])
    const [loading, setLoading] = useState(false)

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        if (selected.length === 0) return alert('Seleziona almeno un livello')

        if (!confirm(`Vuoi davvero regalare l'accesso (${selected.join(', ')}) a ${email}?`)) return

        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ action: 'grant_access', email, products: selected })
            })

            const data = await res.json()
            if (res.ok) {
                alert('Successo! ' + data.message)
                setEmail('')
            } else {
                alert('Errore: ' + data.error)
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete')
        } finally {
            setLoading(false)
        }
    }

    const toggle = (val: string) => {
        if (selected.includes(val)) setSelected(selected.filter(s => s !== val))
        else setSelected([...selected, val])
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 h-fit">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 p-1 rounded text-xs">NUOVO</span>
                Regala Accesso
            </h2>
            <form onSubmit={handleGrant} className="space-y-4">
                <div>
                    <label htmlFor="grant-email" className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Utente</label>
                    <input
                        id="grant-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="amico@esempio.com"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">L'utente deve essere già registrato.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Livelli da Sbloccare</label>
                    <div className="space-y-2">
                        {['base', 'intermedio', 'avanzato', 'multi_5', 'multi_10', 'multi_25', 'scuola_10'].map(l => (
                            <label key={l} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(l)}
                                    onChange={() => toggle(l)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className={l.includes('multi') || l.includes('scuola') ? "uppercase font-bold text-indigo-700" : "capitalize"}>
                                    {l.replace('_', ' ')}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sblocca Gratis'}
                </button>
            </form>
        </div>
    )
}

function ResetDevicesForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        if (!confirm(`Vuoi davvero forzare il reset dei dispositivi per ${email}?`)) return

        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ action: 'reset_devices_by_email', email })
            })

            const data = await res.json()
            if (res.ok) {
                alert('Successo! Dispositivi resettati per ' + email)
                setEmail('')
            } else {
                alert('Errore: ' + data.error)
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 h-fit">
            <h2 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <MonitorX className="w-5 h-5 text-indigo-600" />
                Forza Reset Dispositivi
            </h2>
            <form onSubmit={handleReset} className="space-y-4">
                <div>
                    <label htmlFor="reset-email" className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Utente</label>
                    <input
                        id="reset-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="utente@esempio.com"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">Svuota le sessioni di questo account.</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Effettua Reset'}
                </button>
            </form>
        </div>
    )
}
