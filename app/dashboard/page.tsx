'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { LogOut, User, Video, ShoppingBag, PlayCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [purchases, setPurchases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ count: 0, totalSpent: 0 })
    const router = useRouter()

    useEffect(() => {
        const checkUserAndData = async () => {
            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }
            setUser(session.user)

            // 2. Fetch Purchases
            try {
                const { data, error } = await supabase
                    .from('purchases')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error

                if (data) {
                    setPurchases(data)
                    // Calcola statistiche
                    const total = data.reduce((acc, curr) => acc + Number(curr.amount), 0)
                    setStats({ count: data.length, totalSpent: total })
                }
            } catch (err) {
                console.error("Errore caricamento dati:", err)
            } finally {
                setLoading(false)
            }
        }
        checkUserAndData()
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 gap-2 text-primary">
            <Loader2 className="animate-spin" /> Caricamento Dashboard...
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* Navbar Dashboard */}
            <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </Link>
                    <div className="font-bold text-primary text-xl hidden sm:block">Area Riservata</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        <User className="w-4 h-4" />
                        {user?.email}
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Esci
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-primary">
                            <Video className="w-6 h-6" />
                            <h3 className="font-bold">I Miei Corsi</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{stats.count}</p>
                        <p className="text-sm text-gray-500">Video pronti da guardare</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-2 text-accent">
                            <ShoppingBag className="w-6 h-6" />
                            <h3 className="font-bold">Investimento</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">€ {stats.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Valore formazione acquisita</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-primary">I Tuoi Contenuti</h2>

                    {purchases.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Video className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Nessun corso attivo</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                Non hai ancora acquistato nessun corso. Torna alla vetrina per sbloccare i contenuti premium.
                            </p>
                            <Link href="/#corsi" className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                                Vai al Catalogo
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {purchases.map((purchase) => (
                                <div key={purchase.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="h-40 bg-gray-200 relative">
                                        {/* Placeholder per thumbnail dinamica in futuro */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            <Video className="w-12 h-12" />
                                        </div>
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <PlayCircle className="w-3 h-3" /> ATTIVO
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-primary mb-2 line-clamp-2">{purchase.course_id}</h3>
                                        <p className="text-xs text-gray-400 mb-4">Acquistato il {new Date(purchase.created_at).toLocaleDateString('it-IT')}</p>

                                        <Link 
                                            href={`/watch/${encodeURIComponent(purchase.course_id)}`}
                                            className="w-full py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            Guarda Ora
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
