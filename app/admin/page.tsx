'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, AlertTriangle, UserX, ShieldAlert, RefreshCw } from 'lucide-react'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [orders, setOrders] = useState<any[]>([])
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            window.location.href = '/login'
            return
        }

        // Simple client-side gate (Server API does real check)
        // We'll just try to fetch stats. If 403, not admin.
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
                fetchOrders(session.access_token)
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
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'get_orders' })
        })
        if (res.ok) {
            const data = await res.json()
            setOrders(data.orders)
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
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
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
                {/* Placeholder for Blocks/Warnings if we had reliable stats */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Minacce Rilevate</div>
                    <div className="text-3xl font-extrabold text-red-600 mt-2">{stats?.securityEvents?.length || 0}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* ORDERS LIST */}
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

                {/* SECURITY LOGS */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
                        <div className="p-6 border-b border-slate-100 pb-4">
                            <h2 className="font-bold text-lg text-slate-800">Eventi di Sicurezza</h2>
                        </div>
                        <div className="p-0">
                            {stats?.securityEvents?.length === 0 ? (
                                <p className="p-6 text-gray-400 text-sm text-center">Nessun evento rilevato.</p>
                            ) : (
                                <ul className="divide-y divide-slate-100">
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
            </div>
        </div>
    )
}
