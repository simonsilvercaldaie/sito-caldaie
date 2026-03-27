'use client'
import { useState, useEffect } from 'react'
import Navbar from "@/components/Navbar"
import Link from "next/link"
import { UserPlus, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { LEGAL_TEXT_CHECKOUT } from "@/lib/legalTexts"
import { PayPalBtn } from "@/components/PayPalBtn"
import { getTestPrice } from "@/lib/pricingLogic"

const EXTRA_PRICE = 400 // €400

export default function AcquistaInvitiExtraPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tosAccepted, setTosAccepted] = useState(false)
    const [tosLoading, setTosLoading] = useState(false)
    const [hasTeamLicense, setHasTeamLicense] = useState(false)
    const [profileCompleted, setProfileCompleted] = useState(false)
    const [purchased, setPurchased] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const currentUser = session?.user || null
            setUser(currentUser)

            if (currentUser) {
                // Check profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('profile_completed')
                    .eq('id', currentUser.id)
                    .maybeSingle()
                setProfileCompleted(profile?.profile_completed ?? false)

                // Check if has team license
                const { data: license } = await supabase
                    .from('team_licenses')
                    .select('id')
                    .eq('owner_user_id', currentUser.id)
                    .maybeSingle()
                setHasTeamLicense(!!license)
            }
            setLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleTosCheckbox = async (checked: boolean) => {
        if (!checked) {
            setTosAccepted(false)
            return
        }

        setTosLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const accessToken = session?.access_token

            if (!accessToken) {
                alert('Sessione scaduta, effettua di nuovo l\'accesso.')
                setTosAccepted(false)
                setTosLoading(false)
                return
            }

            const res = await fetch('/api/accept-tos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok || res.status === 409) {
                setTosAccepted(true)
            } else {
                alert('Impossibile registrare l\'accettazione. Riprova.')
                setTosAccepted(false)
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete. Riprova.')
            setTosAccepted(false)
        } finally {
            setTosLoading(false)
        }
    }

    const handlePurchaseSuccess = async (orderId: string) => {
        if (!user) return

        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token

        if (!accessToken) {
            alert('Sessione scaduta. Effettua di nuovo l\'accesso e riprova.')
            return
        }

        const product_code = 'extra_inviti_5'
        const amount_cents = getTestPrice(EXTRA_PRICE, user?.email) * 100

        try {
            const res = await fetch('/api/complete-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    orderId,
                    product_code,
                    amount_cents,
                    plan_type: 'team'
                })
            })

            const data = await res.json()

            if (res.ok && data.ok) {
                setPurchased(true)
                // Redirect to dashboard after 2s
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 2500)
            } else {
                alert(data.error || 'Errore durante l\'acquisto. Contattaci.')
            }
        } catch (err) {
            console.error(err)
            alert('Errore di rete. Il pagamento potrebbe essere andato a buon fine — contatta simonsilvercaldaie@gmail.com')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Navbar />

            <main className="flex-grow py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-sm border border-indigo-200">
                            <UserPlus className="w-4 h-4" />
                            ESPANSIONE LICENZA
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Pacchetto <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Inviti Extra</span>
                        </h1>
                        <p className="text-lg text-gray-600 max-w-xl mx-auto">
                            Aggiungi <strong>5 nuovi posti</strong> e <strong>10 inviti</strong> alla tua licenza aziendale esistente.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                        {purchased ? (
                            <div className="text-center py-8 relative z-10">
                                <div className="p-4 bg-green-100 text-green-600 rounded-full inline-block mb-4">
                                    <CheckCircle2 className="w-16 h-16" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Inviti aggiunti con successo!</h2>
                                <p className="text-gray-600 mb-6">I nuovi inviti sono già disponibili nella tua dashboard.</p>
                                <p className="text-sm text-gray-400">Reindirizzamento alla dashboard...</p>
                            </div>
                        ) : !hasTeamLicense ? (
                            <div className="text-center py-8 relative z-10">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-full inline-block mb-4">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Nessuna licenza aziendale trovata</h2>
                                <p className="text-gray-600 mb-6">Per acquistare inviti extra devi prima avere una licenza multidipendente attiva.</p>
                                <Link href="/catalogo" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all">
                                    Vai al Catalogo <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="relative z-10 space-y-6">
                                {/* What's included */}
                                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                                    <h3 className="font-bold text-indigo-900 mb-4 text-lg">Cosa include:</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-indigo-800">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                            <span><strong>+5 posti</strong> per nuovi collaboratori</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-indigo-800">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                            <span><strong>+10 inviti</strong> aggiuntivi alla tua licenza</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-indigo-800">
                                            <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                            <span>Si sommano alla licenza esistente</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Price */}
                                <div className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Prezzo</p>
                                    <span className="text-5xl font-extrabold text-gray-900">€ {getTestPrice(EXTRA_PRICE, user?.email).toLocaleString('it-IT')}</span>
                                    <p className="text-sm text-gray-500 mt-1">IVA inclusa • Pagamento una tantum</p>
                                </div>

                                {/* Purchase Flow */}
                                {!user ? (
                                    <div className="text-center space-y-3">
                                        <Link href="/login" className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg text-lg">
                                            Accedi per Acquistare
                                        </Link>
                                    </div>
                                ) : !profileCompleted ? (
                                    <Link href="/completa-profilo?returnTo=/acquista-inviti-extra" className="block w-full py-4 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg text-lg text-center">
                                        ✏️ Compila il profilo per acquistare
                                    </Link>
                                ) : (
                                    <div className="space-y-4">
                                        <label className={`flex items-start gap-3 text-sm text-gray-600 cursor-pointer p-4 bg-gray-50 rounded-xl border-2 ${tosAccepted ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200'} transition-all hover:border-indigo-300 ${tosLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={tosAccepted}
                                                onChange={(e) => handleTosCheckbox(e.target.checked)}
                                                disabled={tosLoading}
                                                className="mt-1 w-5 h-5 accent-indigo-500 flex-shrink-0"
                                            />
                                            <span className="leading-snug">
                                                Dichiaro di aver letto e accettato i{' '}
                                                <Link href="/termini" target="_blank" className="text-indigo-600 underline hover:text-indigo-700">Termini d&apos;Uso</Link>
                                                {' '}e le condizioni di vendita.
                                            </span>
                                        </label>

                                        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {LEGAL_TEXT_CHECKOUT.slice(0, 150)}...
                                        </div>

                                        {tosAccepted ? (
                                            <PayPalBtn
                                                amount={String(getTestPrice(EXTRA_PRICE, user?.email))}
                                                courseTitle="Pacchetto Inviti Extra (5 posti + 10 inviti)"
                                                onSuccess={handlePurchaseSuccess}
                                            />
                                        ) : (
                                            <button disabled className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                                Accetta i Termini per procedere
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Back Link */}
                    <div className="text-center mt-12">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Torna alla Dashboard
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
