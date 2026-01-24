'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, AlertTriangle, UserX, ShieldAlert, RefreshCw } from 'lucide-react'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [tickets, setTickets] = useState<any[]>([])
    const [liveUsers, setLiveUsers] = useState<number>(0)
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
                // Fetch all data
                Promise.all([
                    fetchOrders(session.access_token),
                    fetchTickets(session.access_token),
                    fetchLiveUsers(session.access_token)
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

    const handleRevoke = async (userId: string) => {
        if (!confirm('SEI SICURO? Questo eliminerà gli acquisti dell\'utente e lo disconnetterà immediatamente.')) return

        setActionLoading(true)
        const { data: { session } } = await supabase.auth.getSession()

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ action: 'revoke_user', userId, reason: 'Manual Admin Revocation' })
            })
            if (res.ok) {
                alert('Utente revocato.')
                fetchOrders(session!.access_token) // refresh
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
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ action: 'send_warning', email, reason: 'Abuse detected' })
            })
            if (res.ok) {
                alert('Email inviata.')
            } else {
                alert('Errore invio.')
            }
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
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Build: ADMIN-FIX-TICKETS-01</p>
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

                    {/* SECURITY LOGS (Moved here to balance layout) */}
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

                {/* RIGHT COLUMN: ORDERS (Spans 2 cols) */}
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
                                                    {order.product_code || order.course_id}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono">€{(order.amount / 100).toFixed(2)}</td>
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
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">L'utente deve essere già registrato.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Livelli da Sbloccare</label>
                    <div className="space-y-2">
                        {['base', 'intermedio', 'avanzato'].map(l => (
                            <label key={l} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(l)}
                                    onChange={() => toggle(l)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="capitalize">{l}</span>
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
