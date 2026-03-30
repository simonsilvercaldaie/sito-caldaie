'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Loader2, AlertTriangle, MonitorPlay, CheckCircle, Clock, Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'

type VideoStat = {
    course_id: string;
    watch_seconds: number;
    completed: boolean;
    last_watched: string;
}

type UserSats = {
    user_id: string;
    email: string;
    name: string;
    company: string;
    total_seconds: number;
    completed_count: number;
    last_active: string | null;
    videos: VideoStat[];
}

export default function VideoAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<UserSats[]>([])
    const [search, setSearch] = useState('')
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    useEffect(() => {
        checkAuthAndFetch()
    }, [])

    const checkAuthAndFetch = async () => {
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
                body: JSON.stringify({ action: 'get_all_video_stats' })
            })

            if (res.ok) {
                const data = await res.json()
                setStats(data.global)
                setUsers(data.users || [])
                setAuthorized(true)
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

    const toggleRow = (userId: string) => {
        const next = new Set(expandedRows)
        if (next.has(userId)) next.delete(userId)
        else next.add(userId)
        setExpandedRows(next)
    }

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const s = search.toLowerCase();
        return users.filter(u => 
            u.email.toLowerCase().includes(s) || 
            (u.name && u.name.toLowerCase().includes(s)) ||
            (u.company && u.company.toLowerCase().includes(s))
        )
    }, [users, search])

    const formatTime = (seconds: number) => {
        if (!seconds) return '0 min'
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h} o ${m} min`
        return `${m} min`
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>

    if (!authorized) return (
        <div className="min-h-screen p-10 flex flex-col items-center justify-center bg-gray-50 text-red-600 font-bold">
            <AlertTriangle className="w-16 h-16 mb-4" />
            ACCESSO NEGATO. Questa pagina è riservata agli amministratori.
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-4">
                        <a href="/admin" className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <MonitorPlay className="w-7 h-7 text-indigo-600" />
                            Statistiche Visualizzazioni Video
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Monitoraggio globale dell'attività video dei corsisti.</p>
                </div>
            </header>

            {/* GLOBAL KPI CARDS */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Clock className="w-8 h-8" /></div>
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Ore Erogate totali</div>
                            <div className="text-3xl font-extrabold text-slate-800">{stats.totalHours.toLocaleString()} <span className="text-lg text-slate-500 font-medium">ore</span></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="w-8 h-8" /></div>
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Moduli Completati</div>
                            <div className="text-3xl font-extrabold text-green-600">{stats.totalCompletedModules.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><MonitorPlay className="w-8 h-8" /></div>
                        <div>
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Studenti Attivi</div>
                            <div className="text-3xl font-extrabold text-blue-600">{stats.activeLearners.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Dettaglio Allievi</h2>
                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cerca email, nome o azienda..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[500px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-10"></th>
                                <th className="p-4">Allievo</th>
                                <th className="p-4 text-center">Progresso (Moduli)</th>
                                <th className="p-4">Tempo Visualizzazione</th>
                                <th className="p-4 hidden md:table-cell">Ultimo Accesso Video</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">Nessun utente trovato.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const isExp = expandedRows.has(user.user_id)
                                    const percent = Math.min(100, Math.round((user.completed_count / 27) * 100))
                                    return (
                                        <React.Fragment key={user.user_id}>
                                            <tr 
                                                onClick={() => toggleRow(user.user_id)}
                                                className={`cursor-pointer transition-colors ${isExp ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                                            >
                                                <td className="p-4 text-slate-400">
                                                    {isExp ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5" />}
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800">{user.email}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span>{user.name}</span>
                                                        {user.company && user.company !== '-' && <span className="opacity-50">•</span>}
                                                        {user.company && user.company !== '-' && <span className="text-indigo-600 font-medium">{user.company}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${user.completed_count >= 27 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                            {user.completed_count} / 27
                                                        </span>
                                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                                            <div 
                                                                className={`h-full ${percent === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} 
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-slate-700 font-medium">
                                                    {formatTime(user.total_seconds)}
                                                </td>
                                                <td className="p-4 text-xs text-slate-400 hidden md:table-cell">
                                                    {user.last_active ? new Date(user.last_active).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </td>
                                            </tr>

                                            {/* EXPANDED ROW: DETTAGLIO VIDEO */}
                                            {isExp && (
                                                <tr className="bg-slate-50/50 border-b-2 border-slate-200">
                                                    <td colSpan={5} className="p-0">
                                                        <div className="p-4 pl-14 pr-8 max-h-[400px] overflow-y-auto w-full">
                                                            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Cronologia Video Guardati</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                                {user.videos.map((v, i) => (
                                                                    <div key={i} className={`p-3 rounded-lg border ${v.completed ? 'bg-green-50/50 border-green-200' : 'bg-white border-slate-200'}`}>
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-bold font-mono text-slate-700">{v.course_id.toUpperCase()}</span>
                                                                            {v.completed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-slate-300" />}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 mt-2">
                                                                            Tempo: <span className="font-mono font-medium text-slate-800">{formatTime(v.watch_seconds)}</span>
                                                                        </div>
                                                                        {v.last_watched && (
                                                                            <div className="text-[10px] text-slate-400 mt-1">
                                                                                {new Date(v.last_watched).toLocaleDateString()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    )
}
